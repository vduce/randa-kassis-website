#!/usr/bin/env python3
"""Capture authoritative production content locally. Never writes to Bunny or Krystal."""
import ast
import hashlib
import json
from pathlib import Path
import re
import urllib.parse
import urllib.request
import zipfile
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent.parent
SITE = 'https://randakassis.com'
CDN = 'https://randa-kassis-website.b-cdn.net/MDcontent/public/'
MAPPING = {'article1.md': 'articles.json', 'ed1.md': 'encounterAndDialogue.json',
           'po1.md': 'politicians.json', 'ec1.md': 'essayistandcritics.json'}
PRESERVE = ['encounters/ed1.md', 'encounters/ed4.md',
            'gallery/myeyes/myeyes1.md', 'gallery/myeyes/myeyes5.md']


def read(url):
    with urllib.request.urlopen(url, timeout=30) as response:
        return response.read()


def digest(data):
    return hashlib.sha256(data).hexdigest()


def main():
    destination = ROOT / 'deployment/production'
    metadata = destination / 'metadata'
    metadata.mkdir(parents=True, exist_ok=True)
    preview = ROOT / '.production-preview'
    (preview / 'metadata').mkdir(parents=True, exist_ok=True)
    html = read(SITE + '/').decode()
    script = re.search(r'<script[^>]+src="([^"]+main[^\"]+\.js)"', html).group(1)
    bundle = read(urllib.parse.urljoin(SITE, script)).decode()
    indexes = {}
    pattern = r'''JSON\.parse\(("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')\)'''
    for match in re.finditer(pattern, bundle):
        try:
            data = json.loads(ast.literal_eval(match.group(1)))
            if isinstance(data, list) and data and isinstance(data[0], dict):
                name = MAPPING.get(data[0].get('filename'))
                if name:
                    assert len({x['id'] for x in data}) == len(data), 'Duplicate production IDs'
                    assert len({x['filename'] for x in data}) == len(data), 'Duplicate filenames'
                    indexes[name] = data
        except (ValueError, SyntaxError):
            pass
    assert len(indexes) == 4, 'Could not identify all production indexes'
    manifest = {'capturedAt': datetime.now(timezone.utc).isoformat(), 'source': SITE,
                'sourceBundle': script, 'metadata': {}, 'preservedContent': {}}
    for name, data in indexes.items():
        content = (json.dumps(data, indent=2, ensure_ascii=False) + '\n').encode()
        (metadata / name).write_bytes(content)
        (preview / 'metadata' / name).write_bytes(content)
        manifest['metadata'][name] = {'count': len(data), 'sha256': digest(content)}
    for relative in PRESERVE:
        live = read(SITE + '/' + relative)
        bunny = read(CDN + relative)
        target = destination / 'content-overrides' / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(live)
        manifest['preservedContent'][relative] = {'liveSha256': digest(live), 'bunnySha256': digest(bunny)}
    # Preserve production's SEO/structured data while removing its old compiled bundles.
    html = re.sub(r'<script\b[^>]*\bsrc="[^"]+"[^>]*>\s*</script>', '', html, flags=re.I)
    html = re.sub(r'<link\b[^>]*href="/static/[^\"]+"[^>]*>', '', html, flags=re.I)
    for attrs, body in re.findall(r'<script\b([^>]*)>(.*?)</script>', html, re.I | re.S):
        if 'application/ld+json' in attrs:
            json.loads(body)
        else:
            # Reviewed production-only link correction for the movement's renamed domain.
            assert digest(body.encode()) == 'a47c130a61935400a9466158bac6e593713bd9df8e0c34da961cf3daf289b73f', 'Unexpected inline production script; review before copying'
    (ROOT / 'public/index.html').write_text('\n'.join(line.rstrip() for line in html.splitlines()) + '\n')
    # The preserved head references these public icon assets.
    for tag in re.findall(r'<link\b[^>]*>', html, re.I):
        if 'icon' not in tag.lower():
            continue
        match = re.search(r'href="([^"]+)"', tag)
        if not match:
            continue
        url = urllib.parse.urljoin(SITE, match.group(1))
        parsed = urllib.parse.urlparse(url)
        assert parsed.hostname == 'randakassis.com' and '/' not in parsed.path.lstrip('/'), 'Unexpected icon path'
        (ROOT / 'public' / parsed.path.lstrip('/')).write_bytes(read(url))
    (destination / 'snapshot.json').write_text(json.dumps(manifest, indent=2) + '\n')
    (metadata / '.htaccess').write_text('Options -Indexes\n<IfModule mod_headers.c>\nHeader set Cache-Control "no-cache"\n</IfModule>\n')
    archive = preview / 'production-metadata.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as zipped:
        for file in sorted(metadata.iterdir()):
            zipped.write(file, 'metadata/' + file.name)
    print(json.dumps({'counts': {k: len(v) for k, v in indexes.items()},
                      'preservedFiles': len(PRESERVE), 'archive': str(archive),
                      'archiveSha256': digest(archive.read_bytes())}, indent=2))


if __name__ == '__main__':
    main()
