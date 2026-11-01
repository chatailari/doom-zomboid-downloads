"""Unit tests for the append-only Frontera audit and release gates."""
import unittest
from tools.frontera_audit import compute_summary, format_report, RELEASE_STEPS, classify_error

CHANNEL_016 = {"version": "0.1.6", "version_code": 7,
               "apk_sha256": "a" * 64,
               "url": "https://github.com/chatailari/doom-zomboid-downloads/releases/download/frontera-v0.1.6/FRONTERA_DE_FUEGO_0.1.6_ARM64.apk",
               "status": "canal_anunciado_no_certifica_telefono"}


def make_run(run_id, status, success_steps=(), failure_steps=(), ended="2026-11-01T21:06:00Z"):
    return dict(run_id=run_id, result=status, passed_steps=list(success_steps),
                failed_steps=list(failure_steps),
                error_codes=["FALTA_FIRMA_ANDROID_ORIGINAL"] * len(failure_steps),
                finished_at=ended,
                url=f"https://github.com/chatailari/doom-zomboid-downloads/actions/runs/{run_id}")


class AuditTests(unittest.TestCase):
    def test_failed_signing_never_promotes_successful_compile(self):
        run = make_run(100, "failure", ["Compile and verify version 0.1.7"],
                       ["Require original signing credentials"])
        state = compute_summary([run], CHANNEL_016)
        self.assertEqual(state["ultimo_build_compilado_correcto"]["run_id"], 100)
        self.assertIsNone(state["ultima_publicacion_verificada_ci"])
        self.assertEqual(state["incidentes_agrupados"][0]["ocurrencias"], 1)
        self.assertIn("Require original signing credentials", format_report(state, [run]))

    def test_repeated_errors_are_grouped_but_runs_retained(self):
        runs = [make_run(i, "failure", [], ["Require original signing credentials"])
                for i in (100, 101)]
        state = compute_summary(runs, CHANNEL_016)
        self.assertEqual(state["corridas_registradas"], 2)
        self.assertEqual(state["incidentes_agrupados"][0]["ocurrencias"], 2)

    def test_unknown_old_steps_preserve_distinct_failure_categories(self):
        a = classify_error("Preparar fuente, Android SDK y Godot 4.5.1")
        b = classify_error("Iniciar y fotografiar menú Android 14")
        self.assertNotEqual(a, b)
        self.assertTrue(a.startswith("FALLO_ETAPA_"))

    def test_only_fully_verified_release_promotes_good_checkpoint(self):
        old = make_run(99, "success", ["Compile and verify version 0.1.7"])
        new = make_run(102, "success", list(RELEASE_STEPS), ended="2026-11-01T21:10:00Z")
        state_016 = compute_summary([old,new], CHANNEL_016)
        self.assertIsNone(state_016["ultima_publicacion_verificada_ci"])
        channel17 = dict(CHANNEL_016, version="0.1.7", version_code=8)
        state_017 = compute_summary([old,new], channel17)
        self.assertEqual(state_017["ultima_publicacion_verificada_ci"]["run_id"], 102)
        broken = compute_summary([make_run(103, "failure", [], ["Require original signing credentials"],
                                           ended="2026-11-02T21:10:00Z")], channel17, state_017)
        self.assertEqual(broken["ultima_publicacion_verificada_ci"]["run_id"], 102)


if __name__ == "__main__":
    unittest.main()