const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const crypto = require('crypto');
const root = path.join(__dirname, '..');
const cfg = require('dotenv').parse(fs.readFileSync(path.join(root, '.env.production-preview.local')));
assert.equal(cfg.HOST, '127.0.0.1');
assert.equal(cfg.CONTENT_READ_ONLY, 'true');
assert.equal(cfg.BUNNY_STORAGE_ZONE, 'randa-kassis-website');
assert(/^\d+$/.test(cfg.PORT));
const base = `http://localhost:${cfg.PORT}`;
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'deployment/production/snapshot.json')));
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const categories = ['articles', 'encounters', 'interviews/politicians', 'interviews/painters',
  'interviews/essayistcritics', 'story', 'paintings', 'exhibitions', 'gallery/myeyes', 'gallery/companion', 'gallery/arena'];

(async () => {
  const health = await (await fetch(`${base}/api/storage/health`)).json();
  assert.equal(health.readOnly, true);
  assert.equal(health.metadataSource, 'remote');
  assert.equal(health.zone, 'randa-kassis-website');
  assert.equal(health.contentRoot, 'MDcontent/public');
  const login = await fetch(`${base}/api/admin/login`, { method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'RandaAdmin', Origin: base },
    body: JSON.stringify({ email: cfg.ADMIN_EMAIL, password: cfg.ADMIN_PASSWORD }) });
  assert.equal(login.status, 200);
  assert.equal((await login.json()).user.readOnly, true);
  const headers = { Cookie: login.headers.get('set-cookie').split(';')[0], 'X-Requested-With': 'RandaAdmin', 'Content-Type': 'application/json' };
  const report = { verifiedAt: new Date().toISOString(), localUrl: base, readOnly: true, metadata: {}, categories: {}, preservedContent: {} };
  for (const [name, expected] of Object.entries(manifest.metadata)) {
    const hosted = await fetch(`${cfg.METADATA_SOURCE_URL}/${name}`);
    assert.equal(hosted.status, 200);
    const raw = await hosted.text();
    assert.equal(hash(raw), expected.sha256);
    const local = await (await fetch(`${base}/metadata/${name}`)).json();
    const editor = await (await fetch(`${base}/metadata/api/${name}`, { headers })).json();
    assert.deepEqual(local, JSON.parse(raw));
    assert.deepEqual(editor.data, local);
    assert.equal(local.length, expected.count);
    report.metadata[name] = expected;
  }
  console.log('Hosted metadata, public reads and editor reads agree:', Object.values(report.metadata).reduce((n, v) => n + v.count, 0), 'entries');
  const contentPaths = [];
  for (const category of categories) {
    const response = await fetch(`${base}/api/storage/list?path=${encodeURIComponent('MDcontent/public/' + category)}`, { headers });
    assert.equal(response.status, 200);
    const files = (await response.json()).filter(item => !item.IsDirectory && item.ObjectName.endsWith('.md'));
    report.categories[category] = files.length;
    contentPaths.push(...files.map(file => `${category}/${file.ObjectName}`));
  }
  let checked = 0;
  const pending = [...contentPaths];
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (pending.length) {
      const file = pending.shift();
      const response = await fetch(`${base}/api/content/${file}`);
      assert.equal(response.status, 200, file);
      assert.match(response.headers.get('content-type'), /text\/markdown/);
      const text = await response.text();
      assert(text.trim().length > 0, `Empty Markdown: ${file}`);
      if (manifest.preservedContent[file]) {
        assert.equal(hash(text), manifest.preservedContent[file].liveSha256);
        report.preservedContent[file] = 'matches-current-live-production';
      }
      checked += 1;
    }
  }));
  report.markdownFilesRead = checked;
  for (const [route, method] of [['/api/storage/write', 'PUT'], ['/api/storage/delete?path=MDcontent/public/articles/preview-denied-probe.md', 'DELETE'], ['/metadata/api/articles.json/update', 'POST']]) {
    const response = await fetch(`${base}${route}`, { method, headers, body: method === 'DELETE' ? undefined : JSON.stringify({}) });
    assert.equal(response.status, 403);
  }
  report.mutationsBlocked = true;
  assert.equal((await fetch(`${base}/api/storage/list?path=MDcontent/public/articles`)).status, 401);
  report.anonymousAdminAccessBlocked = true;
  fs.writeFileSync(path.join(root, '.production-preview/verification.json'), JSON.stringify(report, null, 2));
  console.log('Production Bunny categories:', JSON.stringify(report.categories));
  console.log('Markdown documents read:', checked, '; preserved live documents:', Object.keys(report.preservedContent).length);
  console.log('Authenticated mutations blocked; anonymous admin access blocked. Verification passed.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
