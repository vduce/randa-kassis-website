const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

let upstream, server, base, directory, cookie;
const requests = [];
before(async () => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'randa-api-test-'));
  fs.writeFileSync(path.join(directory, 'articles.json'), '[]');
  upstream = http.createServer((req, res) => {
    requests.push({ method: req.method, path: req.url, key: req.headers.accesskey });
    res.setHeader('Content-Type', 'application/json');
    res.end(req.url.endsWith('/') ? JSON.stringify([{ ObjectName: 'article1.md', IsDirectory: false }]) : '# Test article');
  });
  await new Promise(resolve => upstream.listen(0, '127.0.0.1', resolve));
  Object.assign(process.env, { NODE_ENV: 'test', ADMIN_EMAIL: 'admin@example.test',
    ADMIN_PASSWORD: 'test-only-password', ADMIN_SESSION_SECRET: 'test-only-session-secret',
    BUNNY_STORAGE_ZONE: 'test-zone', BUNNY_STORAGE_API_KEY: 'test-only-key',
    BUNNY_STORAGE_ENDPOINT: `http://127.0.0.1:${upstream.address().port}`, METADATA_DIR: directory });
  server = require('../server').listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await Promise.all([new Promise(resolve => server.close(resolve)), new Promise(resolve => upstream.close(resolve))]);
  fs.rmSync(directory, { recursive: true });
});

const adminHeaders = () => ({ Cookie: cookie, 'Content-Type': 'application/json', 'X-Requested-With': 'RandaAdmin' });

test('anonymous visitors can read published metadata, but cannot list, read, write or delete storage', async () => {
  assert.equal((await fetch(`${base}/metadata/articles.json`)).status, 200);
  assert.equal((await fetch(`${base}/metadata/api/health`)).status, 200);
  for (const [route, method] of [
    ['/api/storage/list?path=public/public/articles', 'GET'],
    ['/api/storage/read?path=public/public/articles/article1.md', 'GET'],
    ['/api/storage/write', 'PUT'], ['/api/storage/delete?path=public/public/articles/article1.md', 'DELETE'],
    ['/metadata/api/articles.json/update', 'POST'], ['/metadata/api/articles.json/entry/article1.md', 'DELETE'],
  ]) assert.equal((await fetch(`${base}${route}`, { method })).status, 401);
  assert.equal(requests.length, 0);
});

test('login is checked by the server and issues an HttpOnly, SameSite cookie', async () => {
  const headers = { 'Content-Type': 'application/json', 'X-Requested-With': 'RandaAdmin' };
  assert.equal((await fetch(`${base}/api/admin/login`, { method: 'POST', headers,
    body: JSON.stringify({ email: 'admin@example.test', password: 'wrong' }) })).status, 401);
  assert.equal((await fetch(`${base}/api/admin/login`, { method: 'POST', headers: { ...headers, Origin: 'https://foreign.example' },
    body: JSON.stringify({ email: 'admin@example.test', password: 'test-only-password' }) })).status, 403);
  const response = await fetch(`${base}/api/admin/login`, { method: 'POST', headers,
    body: JSON.stringify({ email: 'admin@example.test', password: 'test-only-password' }) });
  assert.equal(response.status, 200);
  const setCookie = response.headers.get('set-cookie');
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /SameSite=Strict/);
  cookie = setCookie.split(';')[0];
  assert.equal((await fetch(`${base}/api/admin/session`, { headers: adminHeaders() })).status, 200);
  assert.equal((await fetch(`${base}/api/admin/session`, { headers: { Cookie: `${cookie}tampered` } })).status, 401);
});

test('authenticated admin reaches only the configured content root using server credentials', async () => {
  const response = await fetch(`${base}/api/storage/list?path=public/public/articles`, { headers: adminHeaders() });
  assert.equal(response.status, 200);
  assert.equal((await response.json())[0].ObjectName, 'article1.md');
  assert.deepEqual(requests.at(-1), { method: 'GET', path: '/test-zone/public/public/articles/', key: 'test-only-key' });
  for (const badPath of ['public/articles', 'public/public/articles/../story', 'public/public/other-project', 'public/public/articles/article1.md?x=1']) {
    assert.equal((await fetch(`${base}/api/storage/read?path=${encodeURIComponent(badPath)}`, { headers: adminHeaders() })).status, 400);
  }
  assert.equal(requests.length, 1);
});

test('writes need the admin request header and update only the isolated metadata fixture', async () => {
  const body = JSON.stringify({ entryFilename: 'article1.md', metadata: { title: 'Fixture' } });
  assert.equal((await fetch(`${base}/metadata/api/articles.json/update`, {
    method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' }, body,
  })).status, 403);
  const response = await fetch(`${base}/metadata/api/articles.json/update`, { method: 'POST', headers: adminHeaders(), body });
  assert.equal(response.status, 200);
  const metadata = await (await fetch(`${base}/metadata/articles.json`)).json();
  assert.equal(metadata[0].title, 'Fixture');
  const read = await fetch(`${base}/api/storage/read?path=public/public/articles/article1.md`, { headers: adminHeaders() });
  assert.equal((await read.json()).content, '# Test article');
  assert.equal((await fetch(`${base}/api/admin/logout`, { method: 'POST', headers: adminHeaders() })).status, 200);
});
