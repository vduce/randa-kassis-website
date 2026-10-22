#!/usr/bin/env python3
"""Read-only release checks behind maintenance; only writes a private success receipt."""
import hashlib
import importlib.util
import json
from pathlib import Path
import time
import urllib.error
import urllib.request

PUBLIC = Path('/home/randakas/public_html')
STATE = Path('/home/randakas/randa-production-window')
APP = Path('/home/randakas/randa-kassis-website')
BASE = 'https://randakassis.com'
sha = lambda data: hashlib.sha256(data).hexdigest()


def main():
    release = Path(__file__).resolve().parent
    if Path.home() != Path('/home/randakas') or not (PUBLIC / '.randa-maintenance').is_file():
        raise SystemExit('Run on the production account during approved maintenance')
    manifest = json.loads((release / 'release-manifest.json').read_text())
    state = json.loads((STATE / 'state.json').read_text())
    if state['phase'] != 'routing-installed' or state['releaseId'] != manifest['releaseId']:
        raise SystemExit('Release/routing state mismatch')
    token = (STATE / 'operator-token').read_text().strip()
    spec = importlib.util.spec_from_file_location('content_sync', release / 'sync-production-content.py')
    sync = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(sync)
    env = sync.read_env(APP / '.env')
    for key, expected in {'NODE_ENV':'production', 'CONTENT_READ_ONLY':'false', 'METADATA_SOURCE_URL':'', 'CONTENT_OVERRIDE_DIR':'',
                          'METADATA_DIR':str(PUBLIC / 'metadata'), 'ADMIN_ORIGIN':BASE, 'BUNNY_STORAGE_ZONE':'randa-kassis-website',
                          'BUNNY_CONTENT_ROOT':'MDcontent/public'}.items():
        if env.get(key, '') != expected: raise RuntimeError('Configuration needs review: ' + key)
    if len(env.get('ADMIN_PASSWORD', '')) < 20 or len(env.get('ADMIN_SESSION_SECRET', '')) < 48:
        raise RuntimeError('Production admin secrets are missing or too short')
    if (APP / '.env').stat().st_mode & 0o077: raise RuntimeError('Set private .env permissions to 0600')
    def request(route, *, bypass=True, cookie=None, method='GET', data=None):
        headers = {'X-Randa-Release-Check':token} if bypass else {}
        if cookie: headers['Cookie'] = cookie
        if method != 'GET': headers.update({'Content-Type':'application/json','Origin':BASE,'X-Requested-With':'RandaAdmin'})
        req = urllib.request.Request(BASE + route, headers=headers, method=method, data=json.dumps(data).encode() if data is not None else None)
        try: response = urllib.request.urlopen(req, timeout=30)
        except urllib.error.HTTPError as failure: response = failure
        with response: return response.status, response.headers, response.read()
    checks = []
    for route in ['/', '/articles', '/admin', '/api/storage/health', '/metadata/articles.json']:
        status, headers, body = request(route, bypass=False)
        assert status == 503 and headers.get('Retry-After') == '600' and b'back shortly' in body, ('Maintenance guard', route)
    checks.append('Public requests remain behind maintenance')
    for name, expected in manifest['payloadSha256'].items():
        assert sha((APP / name).read_bytes()) == expected, ('Installed payload mismatch', name)
        if name.startswith('build/'):
            assert sha((PUBLIC / name[6:]).read_bytes()) == expected, ('Public asset mismatch', name)
    for route in ['/', '/articles', '/articles/', '/admin', '/admin/dashboard']:
        status, _, body = request(route)
        assert status == 200 and sha(body) == manifest['payloadSha256']['build/index.html'], ('SPA route', route)
    assets = json.loads((APP / 'build/asset-manifest.json').read_text())['entrypoints']
    for asset in assets:
        status, _, body = request('/' + asset.lstrip('/'))
        assert status == 200 and sha(body) == manifest['payloadSha256']['build/' + asset.lstrip('/')], ('Asset', asset)
    checks.append('Installed payload, SPA routes and entrypoint assets match release')
    for name, record in manifest['snapshot']['metadata'].items():
        status, _, body = request('/metadata/' + name)
        assert status == 200 and sha(body) == record['sha256'] and len(json.loads(body)) == record['count'], ('Metadata', name)
    status, _, body = request('/api/storage/health')
    health = json.loads(body)
    assert status == 200 and health['zone'] == 'randa-kassis-website' and health['contentRoot'] == 'MDcontent/public' and health['readOnly'] is False and health['metadataSource'] == 'local'
    assert request('/metadata/api/health')[0] == 200
    for name, record in manifest['snapshot']['preservedContent'].items():
        status, _, body = request('/api/content/' + name)
        assert status == 200 and sha(body) == record['liveSha256'], ('Preserved content', name)
    checks.append('Production metadata, Bunny health and four preserved documents')
    status, headers, body = request('/api/admin/login', method='POST', data={'email':env['ADMIN_EMAIL'],'password':env['ADMIN_PASSWORD']})
    assert status == 200 and json.loads(body)['success'] is True, 'Admin login'
    cookie_header = headers.get('Set-Cookie', '')
    assert all(part in cookie_header.lower() for part in ['httponly','secure','samesite=strict']), 'Admin cookie flags'
    cookie = cookie_header.split(';')[0]
    assert request('/api/admin/session', cookie=cookie)[0] == 200
    status, _, body = request('/api/storage/list?path=MDcontent/public/articles', cookie=cookie)
    assert status == 200 and isinstance(json.loads(body), list) and len(json.loads(body)) >= 52, 'Bunny listing'
    for route, method in [('/api/storage/write','PUT'),('/api/storage/delete','DELETE'),('/metadata/api/articles.json/update','POST')]:
        assert request(route, method=method, data={})[0] == 401, ('Unauthenticated write', route)
    assert request('/api/admin/logout', method='POST', cookie=cookie, data={})[0] == 200
    checks.append('Admin login/session, secure cookie, Bunny listing, unauthenticated writes rejected')
    receipt = {'releaseId':manifest['releaseId'], 'passed':True, 'verifiedAtUnix':time.time(),
               'indexSha256':sha((PUBLIC / 'index.html').read_bytes()), 'htaccessSha256':sha((PUBLIC / '.htaccess').read_bytes()), 'checks':checks}
    temporary = STATE / 'verification.new'
    temporary.write_text(json.dumps(receipt, indent=2) + '\n')
    temporary.chmod(0o600)
    temporary.replace(STATE / 'verification.json')
    print('PASS: release verification; receipt valid for five minutes. Maintenance is still active.')

if __name__ == '__main__': main()
