const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
let root, origin, app, base, cookie;
const storageCalls = [];
const published = [{ id: 1, filename: 'article1.md', title: 'Production metadata' }];
const markdown = '# اختبار — Production text';
before(async () => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'randa-preview-'));
  fs.mkdirSync(path.join(root, 'overrides/articles'), { recursive: true });
  fs.writeFileSync(path.join(root, 'overrides/articles/article2.md'), '# Preserved live content');
  origin = http.createServer((req, res) => {
    if (req.url === '/metadata/articles.json') {
      res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify(published));
    }
    if (req.url.startsWith('/metadata/')) return res.end('<html>not JSON</html>');
    storageCalls.push({ method: req.method, key: req.headers.accesskey, url: req.url });
    const bytes = Buffer.from(markdown);
    res.write(bytes.subarray(0, 4));
    setImmediate(() => res.end(bytes.subarray(4)));
  });
  await new Promise(resolve => origin.listen(0, '127.0.0.1', resolve));
  const upstream = `http://127.0.0.1:${origin.address().port}`;
  Object.assign(process.env, { NODE_ENV: 'test', CONTENT_READ_ONLY: 'true',
    METADATA_SOURCE_URL: `${upstream}/metadata`, METADATA_DIR: root,
    CONTENT_OVERRIDE_DIR: path.join(root, 'overrides'),
    BUNNY_STORAGE_ZONE: 'production-zone', BUNNY_STORAGE_ENDPOINT: upstream,
    BUNNY_STORAGE_API_KEY: 'test-read-only-key', BUNNY_CONTENT_ROOT: 'MDcontent/public',
    ADMIN_EMAIL: 'preview@example.test', ADMIN_PASSWORD: 'test-only-preview-password', ADMIN_SESSION_SECRET: 'test-secret' });
  app = require('../server').listen(0, '127.0.0.1');
  await new Promise(resolve => app.once('listening', resolve));
  base = `http://127.0.0.1:${app.address().port}`;
  const login = await fetch(`${base}/api/admin/login`, { method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'RandaAdmin' },
    body: JSON.stringify({ email: 'preview@example.test', password: 'test-only-preview-password' }) });
  assert.equal(login.status, 200);
  assert.equal((await login.json()).user.readOnly, true);
  cookie = login.headers.get('set-cookie').split(';')[0];
});
after(async () => {
  await Promise.all([new Promise(r => app.close(r)), new Promise(r => origin.close(r))]);
  fs.rmSync(root, { recursive: true, force: true });
});

test('public and admin metadata reads use the hosted production source', async () => {
  assert.deepEqual(await (await fetch(`${base}/metadata/articles.json`)).json(), published);
  assert.deepEqual((await (await fetch(`${base}/metadata/api/articles.json`)).json()).data, published);
  assert.equal((await fetch(`${base}/metadata/politicians.json`)).status, 502);
});

test('published Markdown is fetched through the server with UTF-8 preserved', async () => {
  const response = await fetch(`${base}/api/content/articles/article1.md`);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), markdown);
  assert.equal(storageCalls.at(-1).key, 'test-read-only-key');
  assert.equal(storageCalls.at(-1).url, '/production-zone/MDcontent/public/articles/article1.md');
});

test('preserved live content is used in both the website and editor', async () => {
  const before = storageCalls.length;
  assert.equal(await (await fetch(`${base}/api/content/articles/article2.md`)).text(), '# Preserved live content');
  const read = await fetch(`${base}/api/storage/read?path=MDcontent/public/articles/article2.md`, { headers: { Cookie: cookie } });
  assert.equal((await read.json()).content, '# Preserved live content');
  assert.equal(storageCalls.length, before);
});

test('even an authenticated preview user cannot mutate production storage or metadata', async () => {
  const before = storageCalls.length;
  for (const [route, method] of [['/api/storage/write', 'PUT'], ['/api/storage/delete?path=MDcontent/public/articles/article1.md', 'DELETE'],
    ['/metadata/api/articles.json/update', 'POST'], ['/metadata/api/articles.json/entry/article1.md', 'DELETE']]) {
    const response = await fetch(`${base}${route}`, { method, headers: { Cookie: cookie, 'X-Requested-With': 'RandaAdmin' } });
    assert.equal(response.status, 403);
  }
  assert.equal(storageCalls.length, before);
  assert.equal((await fetch(`${base}/api/content/articles/%2e%2e%2fsecret.md`)).status, 400);
});
