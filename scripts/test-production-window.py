#!/usr/bin/env python3
"""Exercise the actual .htaccess rules on a private local Apache instance."""
import argparse
import importlib.util
import json
import os
from pathlib import Path
import shutil
import signal
import socket
import subprocess
import tempfile
import time
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('production_window', ROOT / 'scripts/production-window.py')
window = importlib.util.module_from_spec(spec)
spec.loader.exec_module(window)


def apache_config(directory, port):
    modules = ['mpm_prefork', 'unixd', 'authz_core', 'rewrite', 'headers', 'mime', 'dir']
    module_lines = '\n'.join('LoadModule {}_module /usr/libexec/apache2/mod_{}.so'.format(x, x) for x in modules)
    text = '''ServerRoot "/usr"
Listen 127.0.0.1:{port}
ServerName localhost
PidFile "{base}/httpd.pid"
ErrorLog "{base}/error.log"
LogLevel warn
{modules}
TypesConfig /private/etc/apache2/mime.types
DocumentRoot "{base}/public"
DirectoryIndex index.html
<Directory "{base}/public">
  AllowOverride All
  Options FollowSymLinks
  Require all granted
</Directory>
'''.format(port=port, base=directory, modules=module_lines)
    config = directory / 'httpd.conf'
    config.write_text(text)
    return config


def request(base, route, token=None, method='GET'):
    headers = {'X-Randa-Release-Check': token} if token else {}
    req = urllib.request.Request(base + route, headers=headers, method=method)
    try:
        response = urllib.request.urlopen(req, timeout=5)
    except urllib.error.HTTPError as failure:
        response = failure
    return response.status, dict(response.headers), response.read()


def setup(directory):
    public = directory / 'public'
    public.mkdir()
    (public / 'index.html').write_text('ORIGINAL WEBSITE')
    (public / '.htaccess').write_text('RewriteEngine On\nRewriteCond %{REQUEST_FILENAME} !-f\nRewriteRule ^ index.html [L]\n')
    (public / 'metadata').mkdir()
    (public / 'metadata/articles.json').write_text('[{"id":1}]')
    (public / 'static').mkdir()
    (public / 'static/old.js').write_text('OLD_ASSET')
    (public / '.well-known/acme-challenge').mkdir(parents=True)
    (public / '.well-known/acme-challenge/check').write_text('ACME_OK')
    manifest = {'releaseId': 'local-test', 'baseline': {'indexSha256': window.sha(public / 'index.html')},
                'snapshot': {'metadata': {'articles.json': {'sha256': window.sha(public / 'metadata/articles.json')}}}}
    return public, manifest


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--preview', action='store_true')
    args = parser.parse_args()
    if args.preview:
        directory = ROOT / '.production-release/maintenance-preview'
        directory.mkdir(parents=True, exist_ok=True)
        if (directory / 'httpd.pid').exists():
            raise SystemExit('Maintenance preview may already be running; inspect its PID before restarting')
        # Preserve any prior evidence, but the new preview uses a new fixture directory.
        directory = directory / ('run-' + str(int(time.time())))
        directory.mkdir()
        port = 3045
    else:
        directory = Path(tempfile.mkdtemp(prefix='randa-maintenance-test-')).resolve()
        with socket.socket() as sock:
            sock.bind(('127.0.0.1', 0))
            port = sock.getsockname()[1]
    public, manifest = setup(directory)
    config = apache_config(directory, port)
    subprocess.run(['/usr/sbin/httpd', '-t', '-f', str(config)], check=True)
    process = subprocess.Popen(['/usr/sbin/httpd', '-f', str(config), '-D', 'FOREGROUND'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    base = 'http://localhost:' + str(port)
    try:
        for attempt in range(50):
            if process.poll() is not None:
                raise RuntimeError((directory / 'error.log').read_text())
            try:
                if request(base, '/')[0] == 200:
                    break
            except OSError:
                time.sleep(.1)
        else:
            raise RuntimeError('Local Apache did not become ready')
        assert request(base, '/')[2] == b'ORIGINAL WEBSITE'
        state = directory / 'window'
        window.maintenance_on(public, state, ROOT / 'deployment/production/maintenance', manifest)
        token = (state / 'operator-token').read_text().strip()
        checks = []
        for route in ['/', '/articles', '/admin', '/api/storage/health', '/metadata/articles.json', '/static/old.js', '/unknown/path']:
            code, headers, body = request(base, route)
            assert code == 503, (route, code)
            assert 'back shortly' in body.decode(), route
            assert headers.get('Retry-After') == '600', headers
            assert 'no-store' in headers.get('Cache-Control', ''), headers
            checks.append(route)
        assert request(base, '/api/storage/write', method='POST')[0] == 503
        assert request(base, '/admin', method='HEAD')[0] == 503
        assert request(base, '/.well-known/acme-challenge/check')[2] == b'ACME_OK'
        assert request(base, '/', token)[2] == b'ORIGINAL WEBSITE'
        assert request(base, '/', 'incorrect-token')[0] == 503
        assert request(base, '/maintenance/index.html')[0] == 200
        assert not (public / '.randa-maintenance').is_symlink()
        print('PASS: 503 page on all seven routes, POST/HEAD, Retry-After, no-store, ACME and operator verification access', flush=True)
        if args.preview:
            print('CLIENT PREVIEW: ' + base, flush=True)
            print('LOCAL APACHE PID: ' + str(process.pid), flush=True)
            while process.poll() is None:
                time.sleep(1)
            return
        # Wrong/absent verification proof must not remove maintenance.
        try:
            window.maintenance_off(public, state, state / 'missing-proof.json')
            raise AssertionError('Unverified reopening was allowed')
        except RuntimeError:
            assert (public / '.randa-maintenance').exists()
        # Install and exercise final routing with a simulated cPanel-managed block.
        payload = directory / 'payload'
        (payload / 'build/static').mkdir(parents=True)
        (payload / 'build/index.html').write_text('NEW WEBSITE')
        (payload / 'build/static/new.js').write_text('NEW_ASSET')
        (payload / 'server.js').write_text('// local fixture')
        manifest['payloadSha256'] = {str(p.relative_to(payload)): window.sha(p) for p in payload.rglob('*') if p.is_file()}
        (public / 'api').mkdir()
        (public / 'api/.htaccess').write_text('# old api')
        (public / 'articles').mkdir()
        (public / 'articles/index.html').write_text('OLD PLACEHOLDER')
        window.install_files(public, state, directory / 'app', payload, manifest)
        assert request(base, '/')[0] == 503
        managed = '\n# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN\n<IfModule mod_passenger.c>\nPassengerAppRoot /home/randakas/randa-kassis-website\nPassengerStartupFile server.js\n</IfModule>\n# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END\n'
        (public / '.htaccess').write_text((public / '.htaccess').read_text() + managed)
        window.install_routing(public, state, ROOT / 'deployment/production/live.htaccess.template')
        assert request(base, '/articles/', token)[2] == b'NEW WEBSITE'
        assert request(base, '/admin', token)[2] == b'NEW WEBSITE'
        assert request(base, '/api/storage/health', token)[0] == 404 # No Passenger on the local fixture; importantly not SPA HTML.
        assert request(base, '/admins/index.php', token)[0] == 403
        assert request(base, '/.randa-maintenance', token)[0] == 403
        receipt = state / 'verification.json'
        proof = {'releaseId':'local-test', 'passed':True, 'verifiedAtUnix':time.time()-301,
                 'indexSha256':window.sha(public / 'index.html'), 'htaccessSha256':window.sha(public / '.htaccess')}
        receipt.write_text(json.dumps(proof))
        try:
            window.maintenance_off(public, state, receipt)
            raise AssertionError('Stale verification was accepted')
        except RuntimeError:
            assert (public / '.randa-maintenance').exists()
        proof['verifiedAtUnix'] = time.time()
        receipt.write_text(json.dumps(proof))
        window.maintenance_off(public, state, receipt)
        assert request(base, '/')[2] == b'NEW WEBSITE'
        assert request(base, '/articles/')[2] == b'NEW WEBSITE'
        print('PASS: payload install, legacy-directory routing, private paths, stale-proof rejection and verified reopening', flush=True)
        # Rollback restores the old site but never overwrites later metadata edits.
        (public / 'metadata/articles.json').write_text('[{"id":1},{"id":2}]')
        window.rollback(public, state)
        assert request(base, '/')[2] == b'ORIGINAL WEBSITE'
        assert not (public / 'static/new.js').exists()
        assert (public / 'static/old.js').read_text() == 'OLD_ASSET'
        assert (public / 'api/.htaccess').read_text() == '# old api'
        assert json.loads((public / 'metadata/articles.json').read_text()) == [{'id': 1}, {'id': 2}]
        print('PASS: unverified reopening refused; rollback restores website and preserves metadata', flush=True)
    finally:
        if process.poll() is None:
            process.send_signal(signal.SIGTERM)
            process.wait(timeout=10)
        if not args.preview:
            shutil.rmtree(directory)


if __name__ == '__main__':
    main()
