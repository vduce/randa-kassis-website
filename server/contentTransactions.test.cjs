const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { deleteContent, rememberHighWater, createMutationLock } = require('./contentTransactions');

async function fixture(run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'randa-delete-'));
  const metadataFile = path.join(root, 'articles.json');
  const metadata = [1, 2, 3].map(id => ({ id, filename: `article${id}.md`, title: `Article ${id}` }));
  const bytes = JSON.stringify(metadata, null, 2);
  fs.writeFileSync(metadataFile, bytes);
  const files = new Map([1, 2, 3].map(id => [`MDcontent/public/articles/article${id}.md`, `# Original ${id}`]));
  const originalFiles = new Map(files);
  const events = [];
  let failure = () => false;
  const request = async (url, options) => {
    const file = new URL(url).pathname.replace('/zone/', '');
    const method = options.method;
    events.push(`${method} ${file}`);
    if (failure(method, file)) return { ok: false, status: 503 };
    if (method === 'GET') return { ok: files.has(file), status: files.has(file) ? 200 : 404, text: async () => files.get(file) };
    if (method === 'PUT') files.set(file, options.body);
    if (method === 'DELETE') files.delete(file);
    return { ok: true, status: 200 };
  };
  const options = { filePath: 'MDcontent/public/articles/article1.md', metadataFilename: 'articles.json',
    metadataDir: root, backupDir: path.join(root, 'private-backups'), request,
    baseUrl: 'https://storage.example.test/zone', apiKey: 'test-only-key' };
  try { await run({ root, metadataFile, bytes, files, originalFiles, events, options, fail: fn => { failure = fn; } }); }
  finally { fs.rmSync(root, { recursive: true, force: true }); }
}

test('successful deletion preserves every other file and ID, and snapshots the deleted document', async () => fixture(async f => {
  const originalPermissions = fs.statSync(f.metadataFile).mode & 0o777;
  const result = await deleteContent(f.options);
  assert.equal(result.success, true);
  assert.equal(f.events[0].split(' ')[0], 'GET');
  assert.equal(f.files.has('MDcontent/public/articles/article1.md'), false);
  assert.equal(f.files.get('MDcontent/public/articles/article2.md'), '# Original 2');
  assert.equal(f.files.get('MDcontent/public/articles/article3.md'), '# Original 3');
  assert.deepEqual(JSON.parse(fs.readFileSync(f.metadataFile)).map(x => x.id), [2, 3]);
  assert.equal(fs.statSync(f.metadataFile).mode & 0o777, originalPermissions);
  assert.deepEqual(JSON.parse(fs.readFileSync(f.metadataFile)).map(x => x.title), ['Article 2', 'Article 3']);
  const journal = JSON.parse(fs.readFileSync(path.join(f.options.backupDir, result.backupId + '.json')));
  assert.equal(journal.status, 'committed');
  assert.equal(journal.originalMetadata, f.bytes);
  assert.deepEqual(journal.originals, { 'MDcontent/public/articles/article1.md': '# Original 1' });
}));

test('concurrent mutations are refused until the first writer finishes', async () => fixture(async f => {
  const wrap = createMutationLock(f.root);
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const first = wrap(async () => gate)({}, { locals: {} });
  const secondResponse = { locals: {}, status(code) { this.code = code; return this; }, json(value) { this.body = value; return this; } };
  let secondRan = false;
  await wrap(async () => { secondRan = true; })({}, secondResponse);
  assert.equal(secondResponse.code, 423);
  assert.equal(secondRan, false);
  release();
  await first;
  assert.equal(fs.existsSync(path.join(f.root, '.mutation.lock')), false);
}));

test('a missing source stops deletion before any writes', async () => fixture(async f => {
  f.files.delete('MDcontent/public/articles/article1.md');
  await assert.rejects(deleteContent(f.options), { code: 'DELETE_PREFLIGHT_FAILED' });
  assert.equal(f.events.some(x => /^(PUT|DELETE)/.test(x)), false);
  assert.equal(fs.readFileSync(f.metadataFile, 'utf8'), f.bytes);
}));

test('deleting the highest ID never reassigns its public URL to a later upload', async () => fixture(async f => {
  await deleteContent({ ...f.options, filePath: 'MDcontent/public/articles/article3.md' });
  const remaining = JSON.parse(fs.readFileSync(f.metadataFile));
  assert.equal(rememberHighWater(f.root, 'articles.json', remaining, true), 4);
  assert.deepEqual(remaining.map(entry => entry.id), [1, 2]);
}));

test('an upstream failure restores every original file and exact metadata bytes', async () => fixture(async f => {
  let failed = false;
  f.fail((method, file) => {
    if (!failed && method === 'DELETE' && file.endsWith('article1.md')) { failed = true; f.files.delete(file); return true; }
    return false;
  });
  await assert.rejects(deleteContent(f.options), { code: 'DELETE_ROLLED_BACK' });
  assert.deepEqual(f.files, f.originalFiles);
  assert.equal(fs.readFileSync(f.metadataFile, 'utf8'), f.bytes);
}));

test('a metadata write failure also restores the upstream documents', async () => fixture(async f => {
  await assert.rejects(deleteContent({ ...f.options, write: () => { throw new Error('Disk failure'); } }), { code: 'DELETE_ROLLED_BACK' });
  assert.deepEqual(f.files, f.originalFiles);
  assert.equal(fs.readFileSync(f.metadataFile, 'utf8'), f.bytes);
}));

test('failed recovery is explicit and locks subsequent editing for recovery', async () => fixture(async f => {
  f.fail((method, file) => (method === 'DELETE' || method === 'PUT') && file.endsWith('article1.md'));
  await assert.rejects(deleteContent(f.options), { code: 'RECOVERY_REQUIRED', status: 503 });
  assert.equal(fs.existsSync(path.join(f.root, '.recovery-required')), true);
  assert.equal(fs.readFileSync(f.metadataFile, 'utf8'), f.bytes);
}));
