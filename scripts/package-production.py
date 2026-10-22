#!/usr/bin/env python3
"""Create a local, secret-free release. Never uploads or changes hosting."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import shutil
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parent.parent
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    build = ROOT / 'build-release'
    if not (build / 'index.html').is_file():
        raise SystemExit('Build with deployment/production/build.env first')
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    release_id = 'randa-production-' + stamp
    release = ROOT / '.production-release' / release_id
    payload = release / 'payload'
    payload.mkdir(parents=True)
    shutil.copytree(build, payload / 'build', ignore=shutil.ignore_patterns('metadata', '*.map', '.DS_Store'))
    for name in ['server.js', 'server/adminAuth.js', 'server/contentTransactions.js']:
        target = payload / name
        target.parent.mkdir(exist_ok=True)
        shutil.copy2(ROOT / name, target)
    for name in ['package.json', 'package-lock.json']:
        shutil.copy2(ROOT / 'deployment/production/runtime' / name, payload / name)
    for name in ['maintenance', 'content-overrides', 'metadata']:
        shutil.copytree(ROOT / 'deployment/production' / name, release / name)
    for name in ['live.htaccess.template', 'runtime.env.example', 'MAINTENANCE-RUNBOOK.md', 'client-notice.html']:
        shutil.copy2(ROOT / 'deployment/production' / name, release / name)
    for name in ['production-window.py', 'sync-production-content.py', 'verify-production-release.py']:
        shutil.copy2(ROOT / 'scripts' / name, release / name)
    source_files = [ROOT / 'server.js', ROOT / 'package.json', ROOT / 'scripts/build.js', ROOT / 'deployment/production/build.env']
    for directory in ['src', 'public', 'server']:
        source_files.extend(p for p in (ROOT / directory).rglob('*') if p.is_file() and p.name != '.DS_Store')
    manifest = {
        'releaseId': release_id, 'createdAt': datetime.now(timezone.utc).isoformat(),
        'gitHead': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(),
        'sourceState': 'Prepared working tree; sourceSha256 identifies the exact local inputs',
        'nodeVersion': '22.23.3', 'domain': 'randakassis.com',
        'baseline': {'indexSha256': '3a8799d1653c3a8a6258880c2704541edbb04848ae6a7993682d7839a2a62dfa'},
        'snapshot': json.loads((ROOT / 'deployment/production/snapshot.json').read_text()),
        'sourceSha256': {str(p.relative_to(ROOT)): sha(p) for p in sorted(set(source_files))},
        'payloadSha256': {str(p.relative_to(payload)): sha(p) for p in sorted(payload.rglob('*')) if p.is_file()},
    }
    # Reject credentials from every local env file; values are never printed.
    secrets = set()
    for env in ROOT.glob('.env*'):
        if not env.is_file(): continue
        for line in env.read_text().splitlines():
            key, sep, value = line.partition('=')
            if sep and any(x in key.upper() for x in ['PASSWORD', 'SECRET', 'TOKEN', 'API_KEY']):
                value = value.strip().strip('\"\'')
                if len(value) >= 12: secrets.add(value.encode())
    for file in release.rglob('*'):
        if file.is_file():
            content = file.read_bytes()
            if any(value in content for value in secrets):
                raise RuntimeError('Secret scan failed: ' + str(file.relative_to(release)))
            if file.suffix in ['.js', '.html', '.json'] and b'pgcdn.b-cdn.net/public/public' in content:
                raise RuntimeError('DEV content URL in release: ' + str(file.relative_to(release)))
    (release / 'release-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    files = sorted(p for p in release.rglob('*') if p.is_file())
    (release / 'SHA256SUMS').write_text(''.join(sha(p) + '  ' + str(p.relative_to(release)) + '\n' for p in files))
    archive = release.with_suffix('.zip')
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
        for file in sorted(release.rglob('*')):
            if file.is_file(): z.write(file, str(file.relative_to(release.parent)))
    archive.with_suffix('.zip.sha256').write_text(sha(archive) + '  ' + archive.name + '\n')
    (ROOT / '.production-release/latest.json').write_text(json.dumps({'directory': str(release), 'archive': str(archive), 'sha256': sha(archive)}, indent=2) + '\n')
    print(json.dumps({'archive': str(archive), 'sha256': sha(archive), 'sizeBytes': archive.stat().st_size,
                      'secretScan': 'passed', 'metadataExcludedFromPayload': True}, indent=2))

if __name__ == '__main__': main()
