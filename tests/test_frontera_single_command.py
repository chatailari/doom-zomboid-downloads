"""Protect the Frontera one-request release contract from regression."""
import json
import pathlib
import unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
WORKFLOW=ROOT/'.github/workflows/frontera-una-orden.yml'
CALLED=ROOT/'.github/workflows/frontera-v017-publicar-manual.yml'
REQUEST=ROOT/'frontera-de-fuego/release-requests/current.json'

class OneOrderReleaseTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.workflow=WORKFLOW.read_text(encoding='utf-8')
        cls.called=CALLED.read_text(encoding='utf-8')
        cls.request=json.loads(REQUEST.read_text(encoding='utf-8'))

    def test_one_request_automatically_triggers_and_reuses_signed_pipeline(self):
        self.assertIn('frontera-de-fuego/release-requests/current.json',self.workflow)
        self.assertIn('workflow_dispatch:',self.workflow)
        self.assertIn('uses: ./.github/workflows/frontera-v017-publicar-manual.yml',self.workflow)
        self.assertIn('secrets: inherit',self.workflow)
        self.assertIn('workflow_call:',self.called)
        self.assertIn('cancel-in-progress: false',self.workflow)

    def test_package_and_source_identity_protected(self):
        p=self.request
        self.assertEqual(p['app'],'cl.nazaret.fronteradefuego')
        self.assertEqual(p['version'],'0.1.7')
        self.assertEqual(p['version_code'],8)
        self.assertEqual(p['source_commit'],'b8bd2e0130ae30c8ba609bae905cbe26b413b1d3')
        self.assertGreater(p['version_code'],p['previous_code'])

    def test_original_keys_and_publication_gate_present(self):
        s=self.called
        self.assertIn('FRONTERA_KEYSTORE_BASE64',s)
        self.assertIn('FRONTERA_MANIFEST_PRIVATE_KEY_BASE64',s)
        self.assertIn('FRONTERA_PUBLISH_TOKEN',s)
        self.assertIn('Test Android 14 upgrade without deleting data',s)
        self.assertLess(s.index('Test Android 14 upgrade without deleting data'),
                        s.index('Publish signed APK and verify public bytes'))
        self.assertLess(s.index('Publish signed APK and verify public bytes'),
                        s.index('Promote verified Frontera channel (safe to retry)'))

if __name__=='__main__':
    unittest.main()
