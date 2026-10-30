import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import publish_release as publisher

class RecoveryTests(unittest.TestCase):
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

if __name__ == '__main__':unittest.main()
