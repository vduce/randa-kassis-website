#!/usr/bin/env python3
"""Package locally; apply only to the fixed Krystal DEV root. Never deploy metadata."""
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import subprocess
import sys
import urllib.request
import zipfile
from datetime import datetime, timezone

TARGET = Path('/home/randakas/dev.randakassis.com')
NODE = Path('/home/randakas/nodevenv/dev.randakassis.com/20/bin/node')


def env_values(file):
    values = {}
    for line in file.read_text().splitlines():
        if '=' in line and not line.lstrip().startswith('#'):
            key, value = line.split('=', 1)
            values[key.strip()] = value.strip().strip('\"\'')
    return values


def metadata_hashes(root):
    return {f.name: hashlib.sha256(f.read_bytes()).hexdigest()
            for f in (root / 'metadata').glob('*.json')}


def package(destination):
    root = Path(__file__).resolve().parent.parent
    values = env_values(root / '.env')
    settings = {
        'BUNNY_STORAGE_ZONE': values.get('BUNNY_STORAGE_ZONE') or values['REACT_APP_BUNNY_STORAGE_ZONE'],
        'BUNNY_STORAGE_API_KEY': values.get('BUNNY_STORAGE_API_KEY') or values['REACT_APP_BUNNY_STORAGE_API_KEY'],
        'BUNNY_STORAGE_ENDPOINT': values.get('BUNNY_STORAGE_ENDPOINT') or values.get('REACT_APP_BUNNY_STORAGE_ENDPOINT', 'https://storage.bunnycdn.com'),
        'BUNNY_CONTENT_ROOT': 'public/public',
        'ADMIN_ORIGIN': 'https://dev.randakassis.com',
    }
    assert (root / 'build/index.html').is_file(), 'Build the app first'
    private_values = [v for k, v in values.items() if ('PASSWORD' in k or 'API_KEY' in k) and len(v) > 7]
    for file in (root / 'build').rglob('*'):
        if file.is_file() and file.suffix in ('.js', '.map', '.json', '.html'):
            data = file.read_text(errors='ignore')
            assert not any(value in data for value in private_values), 'Secret in build: ' + str(file)
    destination = Path(destination)
    with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED) as archive:
        archive.write(__file__, 'deploy.py')
        archive.writestr('settings.json', json.dumps(settings))
        for name in ('server.js', 'server/adminAuth.js'):
            archive.write(root / name, 'payload/' + name)
        for file in (root / 'build').rglob('*'):
            relative = file.relative_to(root / 'build')
            if file.is_file() and relative.parts[0] != 'metadata' and file.suffix != '.map':
                archive.write(file, 'payload/build/' + str(relative))
    destination.chmod(0o600)
    print('Private DEV package:', destination, 'bytes:', destination.stat().st_size)
    print('SHA256:', hashlib.sha256(destination.read_bytes()).hexdigest())


def apply():
    assert TARGET.resolve() == TARGET and TARGET.is_dir(), 'Unexpected DEV target'
    stage = Path(__file__).resolve().parent
    assert not str(stage).startswith(str(TARGET)), 'Stage outside the document root'
    settings = json.loads((stage / 'settings.json').read_text())
    assert settings['BUNNY_STORAGE_ZONE'] == 'parallelglobe'
    assert settings['BUNNY_CONTENT_ROOT'] == 'public/public'
    assert settings['BUNNY_STORAGE_ENDPOINT'] == 'https://storage.bunnycdn.com'
    # Verify the credential and actual content before changing the running app.
    request = urllib.request.Request(
        settings['BUNNY_STORAGE_ENDPOINT'] + '/parallelglobe/public/public/articles/',
        headers={'AccessKey': settings['BUNNY_STORAGE_API_KEY']})
    with urllib.request.urlopen(request, timeout=20) as response:
        files = json.load(response)
    assert any(f.get('ObjectName') == 'article1.md' for f in files), 'Expected Randa content missing'
    subprocess.run([str(NODE), '--check', str(stage / 'payload/server.js')], check=True)
    subprocess.run([str(NODE), '-e', "for (const m of ['express','cors','dotenv']) require(m); console.log('Runtime dependencies OK')"], cwd=str(TARGET), check=True)
    print('Bunny preflight OK, article objects:', len(files))
    before = metadata_hashes(TARGET)
    assert len(before) == 4, 'Expected four existing metadata indexes'
    release = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    backup = Path('/home/randakas/randa-dev-backups') / release
    backup.mkdir(parents=True, mode=0o700)
    backup.parent.chmod(0o700)
    for name in ('server.js', 'server', '.env', '.htaccess', 'metadata'):
        source = TARGET / name
        if source.is_dir():
            shutil.copytree(str(source), str(backup / name))
        elif source.exists():
            shutil.copy2(str(source), str(backup / name))
    (backup / 'metadata-sha256.json').write_text(json.dumps(before, indent=2))
    if not (TARGET / 'build').is_dir():
        raise RuntimeError('Existing build missing')
    old_env = (TARGET / '.env').read_text()
    values = env_values(TARGET / '.env')
    assert values.get('ADMIN_EMAIL') or values.get('REACT_APP_ADMIN_EMAIL'), 'Admin email not configured'
    assert values.get('ADMIN_PASSWORD') or values.get('REACT_APP_ADMIN_PASSWORD'), 'Admin password not configured'
    settings['ADMIN_SESSION_SECRET'] = values.get('ADMIN_SESSION_SECRET') or secrets.token_hex(48)
    environment = old_env.rstrip() + '\n'
    for key, value in settings.items():
        assert '\n' not in value and '\r' not in value
        environment = re.sub(r'^' + re.escape(key) + r'\s*=.*\n?', '', environment, flags=re.M)
        environment += key + '=' + value + '\n'
    routing = (TARGET / '.htaccess').read_text()
    hardening = '''# Randa DEV: block direct Apache access to private application files.
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule (^|/)\\.(?!well-known(?:/|$)) - [F,L]
RewriteRule ^(?:server(?:/|\\.js$)|package(?:-lock)?\\.json$|stderr\\.log$|.*\\.(?:zip|tar|gz|log)$) - [F,L,NC]
</IfModule>
<IfModule mod_headers.c>
<FilesMatch "\\.json$">
Header set Cache-Control "no-cache"
</FilesMatch>
</IfModule>
'''
    routing = hardening + routing
    try:
        # Keep the complete old build private; stale public bundles contained credentials.
        os.rename(str(TARGET / 'build'), str(backup / 'build'))
        os.rename(str(stage / 'payload/build'), str(TARGET / 'build'))
        (TARGET / 'server').mkdir(exist_ok=True)
        shutil.copy2(str(stage / 'payload/server/adminAuth.js'), str(TARGET / 'server/adminAuth.js'))
        shutil.copy2(str(stage / 'payload/server.js'), str(TARGET / 'server.js'))
        (TARGET / '.env').write_text(environment)
        (TARGET / '.env').chmod(0o600)
        (TARGET / '.htaccess').write_text(routing)
        assert metadata_hashes(TARGET) == before, 'Live metadata changed during deployment'
        (TARGET / 'tmp').mkdir(exist_ok=True)
        (TARGET / 'tmp/restart.txt').touch()
    except Exception:
        # Do not roll back or overwrite content. Restore only deployment artifacts.
        if (backup / 'build').exists():
            if (TARGET / 'build').exists():
                os.rename(str(TARGET / 'build'), str(stage / 'failed-build'))
            os.rename(str(backup / 'build'), str(TARGET / 'build'))
        for name in ('server.js', '.env', '.htaccess'):
            shutil.copy2(str(backup / name), str(TARGET / name))
        (TARGET / 'tmp/restart.txt').touch()
        raise
    print('DEPLOYED DEV ONLY:', release)
    print('PRIVATE BACKUP:', backup)
    print('METADATA UNCHANGED:', json.dumps(before, sort_keys=True))


if __name__ == '__main__':
    if sys.argv[1:] == ['apply']:
        apply()
    elif len(sys.argv) == 3 and sys.argv[1] == 'package':
        package(sys.argv[2])
    else:
        raise SystemExit('Usage: krystal-dev-deploy.py package /private/path/release.zip | deploy.py apply')
