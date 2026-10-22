const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function atomicWrite(filename, content) {
  const temporary = `${filename}.${crypto.randomUUID()}.tmp`;
  try {
    const mode = fs.existsSync(filename) ? fs.statSync(filename).mode & 0o777 : 0o600;
    fs.writeFileSync(temporary, content, { mode });
    fs.chmodSync(temporary, mode);
    fs.renameSync(temporary, filename);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

// One filesystem lock covers all mutations, including across Passenger processes.
// A crashed mutation leaves its lock for deliberate recovery, rather than allowing a second writer.
function createMutationLock(metadataDir) {
  return handler => async (req, res) => {
    const lockPath = path.join(metadataDir, '.mutation.lock');
    if (fs.existsSync(path.join(metadataDir, '.recovery-required'))) {
      return res.status(503).json({ error: 'Content recovery is required before editing', code: 'RECOVERY_REQUIRED' });
    }
    let lock;
    try {
      lock = fs.openSync(lockPath, 'wx', 0o600);
      fs.writeFileSync(lock, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));
    } catch (err) {
      if (lock !== undefined) {
        fs.closeSync(lock);
        try { fs.unlinkSync(lockPath); } catch { /* No content mutation has started. */ }
      }
      return res.status(err.code === 'EEXIST' ? 423 : 503).json({ error: 'Content is locked or unavailable. Please retry after the current operation finishes.' });
    }
    try { await handler(req, res); }
    catch (err) { if (!res.headersSent) res.status(500).json({ error: err.message }); }
    finally {
      fs.closeSync(lock);
      if (!res.locals?.keepContentLock) fs.unlinkSync(lockPath);
    }
  };
}

async function deleteContent({ filePath, metadataFilename, metadataDir, backupDir, request, baseUrl, apiKey, write = atomicWrite }) {
  const filename = path.posix.basename(filePath);
  const metadataPath = metadataFilename && path.join(metadataDir, metadataFilename);
  const originalMetadata = metadataPath ? fs.readFileSync(metadataPath, 'utf8') : null;
  const metadata = originalMetadata === null ? null : JSON.parse(originalMetadata);
  const originals = new Map();
  let backupPath;
  let mutationStarted = false;
  let journal;
  const call = async (method, target, content) => {
    const headers = { AccessKey: apiKey };
    if (content !== undefined) Object.assign(headers, { 'Content-Type': 'text/markdown', 'Content-Length': Buffer.byteLength(content) });
    const response = await request(`${baseUrl}/${target}`, { method, headers, body: content });
    if (!response.ok) throw new Error(`${method} ${target}: HTTP ${response.status}`);
    return response;
  };
  try {
    const targets = [filePath];
    const renames = [];
    if (metadata) {
      if (!metadata.some(entry => entry.filename === filename)) throw new Error('The file is not present in its metadata index');
      rememberHighWater(metadataDir, metadataFilename, metadata);
    }
    // Snapshot every affected document before the first write/delete.
    for (const target of targets) originals.set(target, await (await call('GET', target)).text());
    const backupId = crypto.randomUUID();
    fs.mkdirSync(backupDir, { recursive: true, mode: 0o700 });
    backupPath = path.join(backupDir, `${backupId}.json`);
    journal = { backupId, status: 'prepared', createdAt: new Date().toISOString(), filePath,
      metadataFilename, originalMetadata, originals: Object.fromEntries(originals), renames };
    atomicWrite(backupPath, JSON.stringify(journal));
    mutationStarted = true;
    await call('DELETE', filePath);
    if (metadata) {
      write(metadataPath, JSON.stringify(metadata.filter(entry => entry.filename !== filename), null, 2) + '\n');
    }
    journal.status = 'committed';
    atomicWrite(backupPath, JSON.stringify(journal));
    return { success: true, deleted: filename, backupId, metadataUpdated: Boolean(metadata),
      renumbering: { success: true, renamedFiles: renames, errors: [] } };
  } catch (err) {
    if (!mutationStarted) {
      err.status = 502;
      err.code = 'DELETE_PREFLIGHT_FAILED';
      throw err;
    }
    const recoveryErrors = [];
    for (const [target, content] of originals) {
      try { await call('PUT', target, content); }
      catch (failure) { recoveryErrors.push(failure.message); }
    }
    if (metadataPath) {
      try { atomicWrite(metadataPath, originalMetadata); }
      catch (failure) { recoveryErrors.push(failure.message); }
    }
    journal.status = recoveryErrors.length ? 'recovery-required' : 'rolled-back';
    journal.failure = err.message;
    journal.recoveryErrors = recoveryErrors;
    try { atomicWrite(backupPath, JSON.stringify(journal)); }
    catch (failure) { recoveryErrors.push(`Recovery journal: ${failure.message}`); }
    if (recoveryErrors.length) {
      try { atomicWrite(path.join(metadataDir, '.recovery-required'), JSON.stringify({ backupId: journal.backupId })); }
      catch { /* The HTTP handler retains the mutation lock even when the disk cannot accept this marker. */ }
    }
    const failure = new Error(recoveryErrors.length ? 'Deletion failed and content recovery is required. Editing has been locked.' : 'Deletion failed; the original files and metadata were restored.');
    Object.assign(failure, { status: recoveryErrors.length ? 503 : 502,
      code: recoveryErrors.length ? 'RECOVERY_REQUIRED' : 'DELETE_ROLLED_BACK', backupId: journal.backupId });
    throw failure;
  }
}

function rememberHighWater(metadataDir, filename, entries, allocate = false) {
  const file = path.join(metadataDir, '.id-highwater.json');
  const counters = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  const current = Math.max(Number(counters[filename]) || 0, ...entries.map(entry => Number(entry.id) || 0));
  const value = current + (allocate ? 1 : 0);
  counters[filename] = value;
  atomicWrite(file, JSON.stringify(counters));
  return value;
}

module.exports = { atomicWrite, createMutationLock, deleteContent, rememberHighWater };
