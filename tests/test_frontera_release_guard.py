"""Guardas de publicación seguras: fallar antes de publicar una actualización inválida."""
import pathlib
import unittest

ROOT=pathlib.Path(__file__).resolve().parents[1]
RELEASE=ROOT/".github/workflows/frontera-v017-publicar-manual.yml"
AUDIT=ROOT/".github/workflows/frontera-auditoria.yml"

class GateRegressionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.release=RELEASE.read_text(encoding="utf-8")
        cls.audit=AUDIT.read_text(encoding="utf-8")

    def test_signing_identity_verified_before_gradle(self):
        s=self.release
        signing=s.index("Require original signing credentials")
        rsa=s.index("Require ORIGINAL manifest signing key")
        fingerprint=s.index("Check both original signing identities BEFORE expensive build")
        compiling=s.index("Compile and verify version 0.1.7")
        self.assertLess(signing,compiling)
        self.assertLess(rsa,compiling)
        self.assertLess(fingerprint,compiling)
        self.assertIn("823d6f6c52a5d47d6fd8d1a16a1d6447e98c19fa938427a90734b1cfb3a70ea0",s)
        self.assertIn("cmp -s",s)

    def test_publishing_follows_upgrade_and_signature(self):
        s=self.release
        stages=[
            "Sign APK using original certificate",
            "Test Android 14 upgrade without deleting data",
            "Publish signed APK and verify public bytes",
            "Sign Frontera update manifest with ORIGINAL RSA key",
            "Promote verified Frontera channel (safe to retry)"]
        self.assertEqual([s.index(step) for step in stages],sorted(s.index(step) for step in stages))
        self.assertIn("gh release create frontera-v0.1.7",s)
        self.assertIn("ref: b8bd2e0130ae30c8ba609bae905cbe26b413b1d3",s)
        self.assertIn("--target b8bd2e0130ae30c8ba609bae905cbe26b413b1d3",s)

    def test_manual_publication_and_no_new_certificates(self):
        s=self.release
        self.assertIn("workflow_dispatch:",s)
        self.assertNotIn("    branches: [main]",s)
        for forbidden in ("keytool -genkeypair","openssl genrsa","apksigner sign --key"):
            self.assertNotIn(forbidden,s)

    def test_auditor_does_not_cancel_prior_runs(self):
        s=self.audit
        self.assertIn("cancel-in-progress: false",s)
        self.assertIn("workflow_run:",s)
        self.assertIn("schedule:",s)
        self.assertIn("ref: main",s)

if __name__=="__main__":
    unittest.main()
