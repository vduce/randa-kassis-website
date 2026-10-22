// Read-only checks of the deployed site. Only login/logout use POST; no editorial mutations.
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const crypto = require('crypto');
const root = path.join(__dirname, '..');
const cfg = require('dotenv').parse(fs.readFileSync(path.join(root, '.env.production-release.local')));
const base = 'https://randakassis.com';
const snapshot = JSON.parse(fs.readFileSync(path.join(root, 'deployment/production/snapshot.json')));
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const categories = ['articles', 'encounters', 'interviews/politicians', 'interviews/painters', 'interviews/essayistcritics', 'story', 'paintings', 'exhibitions', 'gallery/myeyes', 'gallery/companion', 'gallery/arena'];
const request = (url, options = {}) => fetch(base + url, { ...options, signal: AbortSignal.timeout(30000) });
(async () => {
  const health = await (await request('/api/storage/health')).json();
  assert.equal(health.zone, 'randa-kassis-website');
  assert.equal(health.contentRoot, 'MDcontent/public');
  assert.equal(health.readOnly, false);
  assert.equal(health.metadataSource, 'local');
  const login = await request('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'RandaAdmin', Origin: base }, body: JSON.stringify({ email: cfg.ADMIN_EMAIL, password: cfg.ADMIN_PASSWORD }) });
  assert.equal(login.status, 200);
  assert.equal((await login.json()).user.readOnly, false);
  const cookie = login.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/i); assert.match(cookie, /Secure/i); assert.match(cookie, /SameSite=Strict/i);
  const headers = { Cookie: cookie.split(';')[0], 'X-Requested-With': 'RandaAdmin', 'Content-Type': 'application/json', Origin: base };
  const report = { verifiedAt: new Date().toISOString(), site: base, metadata: {}, categories: {}, preservedContent: {}, editorialMutationsPerformed: false };
  try {
    for (const [name, record] of Object.entries(snapshot.metadata)) {
      const response = await request('/metadata/' + name);
      assert.equal(response.status, 200);
      const raw = await response.text(); assert.equal(hash(raw), record.sha256); assert.equal(JSON.parse(raw).length, record.count);
      const editor = await (await request('/metadata/api/' + name, { headers })).json();
      assert.deepEqual(editor.data, JSON.parse(raw)); report.metadata[name] = record.count;
    }
    const pending = [];
    for (const category of categories) {
      const response = await request('/api/storage/list?path=' + encodeURIComponent('MDcontent/public/' + category), { headers });
      assert.equal(response.status, 200, category);
      const files = (await response.json()).filter(item => !item.IsDirectory && item.ObjectName.endsWith('.md'));
      report.categories[category] = files.length;
      pending.push(...files.map(file => category + '/' + file.ObjectName));
    }
    report.markdownFilesRead = pending.length;
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (pending.length) {
        const file = pending.shift();
        const response = await request('/api/content/' + file);
        assert.equal(response.status, 200, file);
        assert.match(response.headers.get('content-type'), /text\/markdown/);
        const body = await response.text(); assert(body.trim().length > 0, file);
        if (snapshot.preservedContent[file]) { assert.equal(hash(body), snapshot.preservedContent[file].liveSha256); report.preservedContent[file] = 'verified'; }
      }
    }));
    assert.equal(report.markdownFilesRead, 298);
    assert.equal(Object.keys(report.preservedContent).length, 4);
    assert.equal((await request('/api/storage/list?path=MDcontent/public/articles')).status, 401);
    report.passed = true;
    fs.writeFileSync(path.join(root, '.production-release/live-verification.json'), JSON.stringify(report, null, 2) + '\n');
    console.log('PASS: production admin authentication, 252 metadata entries, all 298 Markdown files across 11 categories, and all four preserved documents. No editorial content changed by verification.');
  } finally { await request('/api/admin/logout', { method: 'POST', headers, body: '{}' }); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
