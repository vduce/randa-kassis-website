#!/usr/bin/env python3
"""Maintenance controls. Plan is read-only; every live change requires an explicit approved window."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import shutil
from datetime import datetime, timezone

PUBLIC = Path('/home/randakas/public_html')
STATE = Path('/home/randakas/randa-production-window')
APP = Path('/home/randakas/randa-kassis-website')
BEGIN = '# BEGIN RANDA MAINTENANCE'
END = '# END RANDA MAINTENANCE'


def sha(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()


def atomic(file, data, mode=0o644):
    temporary = file.with_name(file.name + '.randa-new')
    temporary.write_bytes(data if isinstance(data, bytes) else data.encode())
    temporary.chmod(mode)
    os.replace(str(temporary), str(file))


def read_state(state):
    return json.loads((state / 'state.json').read_text())


def save_state(state, data):
    atomic(state / 'state.json', json.dumps(data, indent=2) + '\n', 0o600)


def render_guard(template, token):
    if not re.fullmatch(r'[a-f0-9]{64}', token):
        raise ValueError('Invalid operator token')
    return template.replace('__OPERATOR_TOKEN__', token)


def maintenance_on(public, state, maintenance, manifest):
    if state.exists() or (public / '.randa-maintenance').exists():
        raise RuntimeError('An existing window or maintenance flag needs review')
    if (public / 'maintenance').exists():
        raise RuntimeError('Existing maintenance directory needs review; refusing overwrite')
    if sha(public / 'index.html') != manifest['baseline']['indexSha256']:
        raise RuntimeError('The live index changed after preparation')
    for name, record in manifest['snapshot']['metadata'].items():
        if sha(public / 'metadata' / name) != record['sha256']:
            raise RuntimeError('Production metadata changed: ' + name)
    state.mkdir(mode=0o700)
    # Private full rollback copy; symlinks are preserved, never followed outside the web root.
    shutil.copytree(str(public), str(state / 'website-before'), symlinks=True)
    token = secrets.token_hex(32)
    atomic(state / 'operator-token', token + '\n', 0o600)
    original = (public / '.htaccess').read_text()
    if BEGIN in original:
        raise RuntimeError('Existing maintenance rules need review')
    data = {'phase': 'backed-up', 'startedAt': datetime.now(timezone.utc).isoformat(),
            'originalHtaccessSha256': sha(public / '.htaccess'), 'touchedPublicFiles': [],
            'releaseId': manifest['releaseId']}
    save_state(state, data)
    (public / 'maintenance').mkdir(mode=0o755)
    for name in ['index.html', '.htaccess']:
        shutil.copy2(str(maintenance / name), str(public / 'maintenance' / name))
    guard = render_guard((maintenance / 'guard.htaccess.template').read_text(), token)
    atomic(public / '.htaccess', guard + '\n' + original)
    atomic(public / '.randa-maintenance', 'Scheduled maintenance\n')
    data['phase'] = 'maintenance'
    save_state(state, data)


def install_files(public, state, app, payload, manifest):
    data = read_state(state)
    if not (public / '.randa-maintenance').is_file():
        raise RuntimeError('Maintenance must be verified before installation')
    if data['phase'] not in ['maintenance', 'files-installed']:
        raise RuntimeError('Unexpected window state')
    # Validate the complete package before touching any application file.
    for name, expected in manifest['payloadSha256'].items():
        if sha(payload / name) != expected:
            raise RuntimeError('Package checksum mismatch: ' + name)
    if data['phase'] == 'maintenance':
        if app.exists():
            shutil.copytree(str(app), str(state / 'application-before'), symlinks=True)
        app.mkdir(parents=True, exist_ok=True)
        # Remove the old, empty API-directory routing from the request path.
        legacy_api = public / 'api'
        if legacy_api.exists():
            if legacy_api.is_symlink() or {x.name for x in legacy_api.iterdir()} - {'.htaccess'}:
                raise RuntimeError('The legacy API directory changed; review before proceeding')
            shutil.move(str(legacy_api), str(state / 'legacy-api-before'))
    for source in sorted(payload.rglob('*')):
        if not source.is_file():
            continue
        relative = source.relative_to(payload)
        target = app / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(str(source), str(target))
        if relative.parts[0] == 'build':
            web_relative = relative.relative_to('build')
            web_target = public / web_relative
            if web_target.is_symlink() or any(parent.is_symlink() for parent in web_target.parents if parent != public.parent):
                raise RuntimeError('Unexpected symlink in public asset destination')
            # Record before each replacement so rollback also covers interrupted copying.
            if str(web_relative) not in data['touchedPublicFiles']:
                data['touchedPublicFiles'].append(str(web_relative))
                save_state(state, data)
            web_target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(str(source), str(web_target))
    data['phase'] = 'files-installed'
    save_state(state, data)


def install_routing(public, state, template):
    data = read_state(state)
    if not (public / '.randa-maintenance').is_file() or data['phase'] != 'files-installed':
        raise RuntimeError('Install and verify app configuration while maintenance is active first')
    current = (public / '.htaccess').read_text()
    blocks = re.findall(r'(?ms)^# DO NOT REMOVE[^\n]*CONFIGURATION BEGIN\n.*?^# DO NOT REMOVE[^\n]*CONFIGURATION END[^\n]*', current)
    managed = '\n'.join(blocks)
    if 'PassengerAppRoot' not in managed or str(APP) not in managed or 'server.js' not in managed:
        raise RuntimeError('cPanel must create the production Passenger configuration first')
    if 'PassengerEnabled off' in managed:
        raise RuntimeError('The production application is still disabled')
    guard = current[current.index(BEGIN):current.index(END) + len(END)] if BEGIN in current else ''
    if not guard:
        raise RuntimeError('The maintenance guard was removed by hosting configuration; restore it before continuing')
    atomic(public / '.htaccess', guard + '\n' + template.read_text().replace('__CPANEL_MANAGED_BLOCKS__', managed))
    data['phase'] = 'routing-installed'
    save_state(state, data)


def maintenance_off(public, state, receipt):
    data = read_state(state)
    if data['phase'] != 'routing-installed' or not receipt.is_file():
        raise RuntimeError('A successful final verification receipt is required')
    proof = json.loads(receipt.read_text())
    age = datetime.now(timezone.utc).timestamp() - proof.get('verifiedAtUnix', 0)
    if proof.get('releaseId') != data['releaseId'] or proof.get('passed') is not True or not 0 <= age <= 300:
        raise RuntimeError('Verification must pass for this release within the last five minutes')
    if proof.get('indexSha256') != sha(public / 'index.html') or proof.get('htaccessSha256') != sha(public / '.htaccess'):
        raise RuntimeError('Site files changed after verification')
    (public / '.randa-maintenance').unlink()
    data['phase'] = 'opened'
    data['openedAt'] = datetime.now(timezone.utc).isoformat()
    save_state(state, data)


def rollback(public, state):
    data = read_state(state)
    if data['phase'] == 'rolled-back':
        return
    atomic(public / '.randa-maintenance', 'Rollback in progress\n')
    # Only deployment-managed assets are restored. Published metadata/content is never reset here.
    backup = state / 'website-before'
    for relative in data['touchedPublicFiles']:
        source, target = backup / relative, public / relative
        if source.exists():
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(str(source), str(target))
        elif target.is_file():
            target.unlink()
    if (state / 'legacy-api-before').exists():
        if (public / 'api').exists():
            raise RuntimeError('Unexpected API directory; refusing overwrite during rollback')
        shutil.move(str(state / 'legacy-api-before'), str(public / 'api'))
    if sha(backup / '.htaccess') != data['originalHtaccessSha256']:
        raise RuntimeError('Rollback routing backup checksum failed')
    atomic(public / '.htaccess', (backup / '.htaccess').read_bytes())
    if (public / '.randa-maintenance').exists():
        (public / '.randa-maintenance').unlink()
    data['phase'] = 'rolled-back'
    save_state(state, data)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('command', choices=['plan', 'begin', 'install', 'routing', 'open', 'rollback'])
    parser.add_argument('--approved-window', action='store_true')
    args = parser.parse_args()
    release = Path(__file__).resolve().parent
    manifest = json.loads((release / 'release-manifest.json').read_text())
    if args.command == 'plan':
        print(json.dumps({'release': manifest['releaseId'], 'target': str(PUBLIC), 'application': str(APP),
                          'approvalRequired': True, 'steps': ['begin', 'install', 'configure cPanel and secrets', 'sync four preserved files', 'routing', 'verify', 'open']}, indent=2))
        return
    if not args.approved_window:
        raise SystemExit('STOP: owner-approved maintenance window required; no live action taken')
    if PUBLIC.resolve() != PUBLIC or not PUBLIC.is_dir() or Path.home() != Path('/home/randakas'):
        raise SystemExit('Wrong host/account or document root; refusing live action')
    if args.command == 'begin': maintenance_on(PUBLIC, STATE, release / 'maintenance', manifest)
    elif args.command == 'install': install_files(PUBLIC, STATE, APP, release / 'payload', manifest)
    elif args.command == 'routing': install_routing(PUBLIC, STATE, release / 'live.htaccess.template')
    elif args.command == 'open': maintenance_off(PUBLIC, STATE, STATE / 'verification.json')
    elif args.command == 'rollback': rollback(PUBLIC, STATE)
    print('Completed:', args.command, 'state:', str(STATE))


if __name__ == '__main__':
    main()
