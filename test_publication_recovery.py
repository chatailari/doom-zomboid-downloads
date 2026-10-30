import json
import os
import hashlib
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import publish_release as publisher

class RecoveryTests(unittest.TestCase):
    def test_public_download_must_match_before_channel_publication(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / 'download.apk'
            data = b'public signed APK bytes'
            def downloaded(*args, **kwargs):
                target.write_bytes(data)
                return subprocess.CompletedProcess([], 0)
            with patch.object(publisher.subprocess, 'run', side_effect=downloaded):
                publisher.verify_public_download('https://example.test/app.apk', target,
                                                 len(data), hashlib.sha256(data).hexdigest())
                with self.assertRaises(ValueError):
                    publisher.verify_public_download('https://example.test/app.apk', target,
                                                     len(data), '0' * 64)
                with self.assertRaises(ValueError):
                    publisher.verify_public_download('https://example.test/app.apk', target,
                                                     len(data) + 1, hashlib.sha256(data).hexdigest())

    def test_transient_release_edit_retries_same_operation(self):
        failure = subprocess.CompletedProcess([], 1, '', 'HTTP 500 temporary error')
        success = subprocess.CompletedProcess([], 0, '{}', '')
        with patch.object(publisher.subprocess, 'run', side_effect=[failure, success]) as run, patch.object(publisher.time, 'sleep'):
            self.assertIs(publisher.gh('release', 'edit', 'android-channel', '--draft=false'), success)
            self.assertEqual(run.call_count, 2)
            self.assertEqual(run.call_args_list[0], run.call_args_list[1])

    def test_release_creation_does_not_retry_ambiguous_failure(self):
        failure = subprocess.CompletedProcess([], 1, '', 'HTTP 500 temporary error')
        with patch.object(publisher.subprocess, 'run', return_value=failure) as run:
            with self.assertRaises(RuntimeError):publisher.gh('release', 'create', 'new-tag')
            self.assertEqual(run.call_count, 1)

    def test_permanent_error_is_not_retried(self):
        failure = subprocess.CompletedProcess([], 1, '', 'HTTP 403 forbidden')
        with patch.object(publisher.subprocess, 'run', return_value=failure) as run:
            self.assertIs(publisher.gh('release', 'edit', 'android-channel', check=False), failure)
            self.assertEqual(run.call_count, 1)

    def test_retry_bound(self):
        failure = subprocess.CompletedProcess([], 1, '', 'HTTP 503 unavailable')
        with patch.object(publisher.subprocess, 'run', return_value=failure) as run, patch.object(publisher.time, 'sleep'):
            with self.assertRaises(RuntimeError):publisher.gh('release', 'edit', 'android-channel')
            self.assertEqual(run.call_count, 3)

    def test_durable_checkpoint_contains_resume_identity(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(publisher, 'Path', side_effect=lambda name:Path(directory)/name):
            publisher.checkpoint('apk_published', 'v0.2.0-dev.7', {'version_code':20007,'sha256':'a'*64,'url':'https://example.test/app.apk'})
            state=json.loads((Path(directory)/'publication-checkpoint.json').read_text())
            self.assertEqual(state['stage'], 'apk_published')
            self.assertEqual(state['version_code'], 20007)
            self.assertFalse((Path(directory)/'publication-checkpoint.tmp').exists())


    def test_delta_publication_verifies_bytes_and_metadata(self):
        with tempfile.TemporaryDirectory() as directory:
            before = os.getcwd()
            try:
                os.chdir(directory)
                Path("delta_parts").mkdir()
                payload = b"valid signed delta segment" * 100
                Path("delta_parts/000.deltapart").write_bytes(payload)
                name = "DOOM-ZOMBOID-0.2.0-dev.9-arm64.apk"
                patch_name = name + ".dzp"
                h = hashlib.sha256(payload).hexdigest()
                spec = {"delta":{"name":patch_name,"size":len(payload),"sha256":h,
                                 "parts":[{"path":"delta_parts/000.deltapart","sha256":h}]}}
                manifest = {"size":99999,"version_code":20009,"delta":{
                    "url":f"https://github.com/{publisher.REPO}/releases/download/v0.2.0-dev.9/{patch_name}",
                    "from_version_code":20008,"size":len(payload),"sha256":h}}
                assets = publisher.verify_delta_asset(spec,manifest,Path(directory),"v0.2.0-dev.9",name)
                self.assertEqual(len(assets),1)
                self.assertEqual(Path(assets[0]).read_bytes(),payload)
                Path("delta_parts/000.deltapart").write_bytes(b"corrupt")
                with self.assertRaises(ValueError):
                    publisher.verify_delta_asset(spec,manifest,Path(directory),"v0.2.0-dev.9",name)
            finally:
                os.chdir(before)

    def test_wrong_delta_base_version_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            name = "DOOM-ZOMBOID-0.2.0-dev.9-arm64.apk"
            manifest = {"size":100000,"version_code":20009,"delta":{
                "url":f"https://github.com/{publisher.REPO}/releases/download/v0.2.0-dev.9/{name}.dzp",
                "from_version_code":20009,"size":2000,"sha256":"a"*64}}
            spec = {"delta":{"name":name+".dzp","size":2000,"sha256":"a"*64,"parts":[]}}
            with self.assertRaises(ValueError):
                publisher.verify_delta_asset(spec,manifest,Path(directory),"v0.2.0-dev.9",name)

if __name__ == '__main__':unittest.main()
