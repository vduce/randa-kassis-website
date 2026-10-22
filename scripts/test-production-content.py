#!/usr/bin/env python3
"""Disposable in-memory storage tests; never contacts Bunny."""
import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('content_sync', Path(__file__).with_name('sync-production-content.py'))
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)

class ContentReconciliation(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.root = Path(self.directory.name)
        self.overrides = self.root / 'overrides'
        self.records, self.objects, self.writes = {}, {}, []
        for name in sorted(sync.ALLOWED):
            old, new = ('old-' + name).encode(), ('new-' + name).encode()
            self.objects[name] = old
            self.records[name] = {'bunnySha256':sync.sha(old), 'liveSha256':sync.sha(new)}
            target = self.overrides / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(new)
        self.originals = dict(self.objects)
        self.backup = self.root / 'backup'
    def tearDown(self): self.directory.cleanup()
    def get(self, name): return self.objects[name]
    def put(self, name, content):
        self.assertIn(name, sync.ALLOWED)
        self.writes.append(name)
        self.objects[name] = content
    def test_apply_and_restore(self):
        sync.apply(self.records, self.overrides, self.backup, self.get, self.put)
        self.assertEqual(len(self.writes), 4)
        sync.restore(self.records, self.backup, self.get, self.put)
        self.assertEqual(self.objects, self.originals)
    def test_changed_source_is_not_overwritten(self):
        self.objects[next(iter(self.objects))] = b'new-editorial-content'
        with self.assertRaises(RuntimeError): sync.apply(self.records, self.overrides, self.backup, self.get, self.put)
        self.assertEqual(self.writes, [])
    def test_partial_upload_failure_restores_prior_upload(self):
        failed = [False]
        def put(name, content):
            if len(self.writes) == 1 and not failed[0]:
                failed[0] = True
                raise RuntimeError('Mock connection failure')
            self.put(name, content)
        with self.assertRaises(RuntimeError): sync.apply(self.records, self.overrides, self.backup, self.get, put)
        self.assertEqual(self.objects, self.originals)
    def test_rollback_does_not_overwrite_new_editorial_change(self):
        sync.apply(self.records, self.overrides, self.backup, self.get, self.put)
        name = next(iter(self.objects))
        self.objects[name] = b'new-editorial-content'
        with self.assertRaises(RuntimeError): sync.restore(self.records, self.backup, self.get, self.put)
        self.assertEqual(self.objects[name], b'new-editorial-content')

if __name__ == '__main__': unittest.main()
