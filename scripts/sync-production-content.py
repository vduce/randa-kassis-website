#!/usr/bin/env python3
"""Only four reviewed files may be reconciled. Default operation is read-only."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import urllib.request

PUBLIC = Path('/home/randakas/public_html')
STATE = Path('/home/randakas/randa-production-window')
APP = Path('/home/randakas/randa-kassis-website')
ALLOWED = {'encounters/ed1.md', 'encounters/ed4.md', 'gallery/myeyes/myeyes1.md', 'gallery/myeyes/myeyes5.md'}
BASE = 'https://storage.bunnycdn.com/randa-kassis-website/MDcontent/public/'
sha = lambda data: hashlib.sha256(data).hexdigest()


def read_env(file):
    result = {}
    for line in file.read_text().splitlines():
        key, sep, value = line.partition('=')
        if sep and not key.lstrip().startswith('#'): result[key.strip()] = value.strip().strip('\"\'')
    return result


def preflight(records, overrides, get):
    if set(records) != ALLOWED: raise RuntimeError('Only the four reviewed files are allowed')
    current = {}
    for name, record in records.items():
        if sha((overrides / name).read_bytes()) != record['liveSha256']:
            raise RuntimeError('Prepared content checksum failed: ' + name)
        current[name] = get(name)
        if sha(current[name]) not in [record['bunnySha256'], record['liveSha256']]:
            raise RuntimeError('Bunny content changed since review: ' + name)
    return current


def restore(records, backup, get, put):
    failures = []
    for name, record in records.items():
        original = backup / name
        if not original.is_file(): continue
        try:
            old = original.read_bytes()
            if sha(old) not in [record['bunnySha256'], record['liveSha256']]:
                raise RuntimeError('Backup checksum failed')
            current = get(name)
            if current == old: continue
            if sha(current) != record['liveSha256']: raise RuntimeError('Concurrent content change; refusing overwrite')
            put(name, old)
            if get(name) != old: raise RuntimeError('Restore verification failed')
        except Exception:
            failures.append(name)
    if failures: raise RuntimeError('Manual recovery needed; preserve backups for: ' + ', '.join(failures))


def apply(records, overrides, backup, get, put):
    current = preflight(records, overrides, get)
    if backup.exists(): raise RuntimeError('A prior content backup exists; review or roll back before retrying')
    backup.mkdir(mode=0o700, parents=True)
    for name, data in current.items():
        destination = backup / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(data)
        destination.chmod(0o600)
    try:
        for name, record in records.items():
            if sha(current[name]) == record['liveSha256']: continue
            if get(name) != current[name]: raise RuntimeError('Content changed during preparation: ' + name)
            put(name, (overrides / name).read_bytes())
            if sha(get(name)) != record['liveSha256']: raise RuntimeError('Upload verification failed: ' + name)
    except Exception:
        restore(records, backup, get, put)
        raise


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('command', nargs='?', choices=['check', 'apply', 'rollback'], default='check')
    parser.add_argument('--env', type=Path, default=APP / '.env')
    parser.add_argument('--approved-window', action='store_true')
    args = parser.parse_args()
    release = Path(__file__).resolve().parent
    manifest = json.loads((release / 'release-manifest.json').read_text())
    records = manifest['snapshot']['preservedContent']
    if set(records) != ALLOWED: raise SystemExit('Unexpected content set')
    if args.command != 'check':
        if not args.approved_window or Path.home() != Path('/home/randakas') or not (PUBLIC / '.randa-maintenance').is_file():
            raise SystemExit('STOP: approved window on the production account with maintenance active required')
        if json.loads((STATE / 'state.json').read_text())['releaseId'] != manifest['releaseId']:
            raise SystemExit('Window/release mismatch')
        for name, record in records.items():
            if sha((PUBLIC / name).read_bytes()) != record['liveSha256']:
                raise SystemExit('Published Krystal content changed; review before syncing: ' + name)
    env = read_env(args.env)
    if env.get('BUNNY_STORAGE_ZONE') != 'randa-kassis-website' or env.get('BUNNY_CONTENT_ROOT') != 'MDcontent/public' or env.get('BUNNY_STORAGE_ENDPOINT') != 'https://storage.bunnycdn.com':
        raise SystemExit('Incorrect production storage configuration')
    key = env['BUNNY_STORAGE_API_KEY']
    def get(name):
        with urllib.request.urlopen(urllib.request.Request(BASE + name, headers={'AccessKey': key}), timeout=30) as response:
            return response.read()
    def put(name, data):
        with urllib.request.urlopen(urllib.request.Request(BASE + name, data=data, method='PUT', headers={'AccessKey': key, 'Content-Type': 'text/markdown; charset=utf-8'}), timeout=30) as response:
            if response.status not in [200, 201, 204]: raise RuntimeError('Bunny rejected upload')
    if args.command == 'check': preflight(records, release / 'content-overrides', get)
    elif args.command == 'apply': apply(records, release / 'content-overrides', STATE / 'bunny-before', get, put)
    else: restore(records, STATE / 'bunny-before', get, put)
    print('PASS: ' + args.command + ' for the four reviewed production documents')

if __name__ == '__main__': main()
