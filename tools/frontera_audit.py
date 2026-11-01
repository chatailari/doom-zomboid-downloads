#!/usr/bin/env python3
"""Append-only, reproducible Frontera de Fuego CI audit and known-good checkpoints.

The GitHub workflow executes this only from the trusted default branch.
The ledger stores outcomes and references, never credentials or unfiltered job logs.
"""
from __future__ import annotations

import argparse
import base64
import collections
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess

REPOSITORY = "chatailari/doom-zomboid-downloads"
ROOT = Path("frontera-de-fuego/auditoria")
BASELINE_RUNS = (41349673211, 41349893200, 41350056549, 41350177159)
PACKAGE = "cl.nazaret.fronteradefuego"
PUB_ASSET = "FRONTERA_DE_FUEGO_0.1.7_ARM64.apk"
BUILD_STEPS = frozenset({"Build Android APK without any signing keys", "Compile and verify version 0.1.7"})
RELEASE_STEPS = frozenset({"Sign APK using original certificate",
                           "Test Android 14 upgrade without deleting data",
                           "Publish signed APK and verify public bytes",
                           "Sign Frontera update manifest with ORIGINAL RSA key",
                           "Promote only authenticated Frontera channel and verify"})


def gh_api(path: str) -> dict:
    # No requests to outside domains or arbitrary commands from run metadata.
    return json.loads(subprocess.check_output(["gh", "api", path], text=True))


def fetch_run(repo: str, run_id: int) -> dict:
    if repo != REPOSITORY or run_id <= 0:
        raise ValueError("Repository/run identity is not approved")
    prefix = f"repos/{repo}/actions"
    raw = gh_api(f"{prefix}/runs/{run_id}")
    if raw.get("status") != "completed":
        raise ValueError(f"Run {run_id} has not completed; no premature result")
    job_data = gh_api(f"{prefix}/runs/{run_id}/jobs?per_page=100")
    if job_data.get("total_count", 0) > len(job_data.get("jobs", [])):
        raise ValueError("Incomplete job pagination; refuse incomplete audit")
    assets = gh_api(f"{prefix}/runs/{run_id}/artifacts?per_page=100")
    if assets.get("total_count", 0) > len(assets.get("artifacts", [])):
        raise ValueError("Incomplete artifact pagination; refuse incomplete audit")
    jobs = []
    for j in job_data.get("jobs", []):
        steps = []
        for s in j.get("steps", []):
            steps.append({"number": s.get("number"), "name": s.get("name"),
                          "status": s.get("status"), "result": s.get("conclusion"),
                          "started_at": s.get("started_at"), "completed_at": s.get("completed_at")})
        jobs.append({"job_id": j.get("id"), "name": j.get("name"),
                     "result": j.get("conclusion"), "steps": steps,
                     "url": j.get("html_url")})
    failing = [s["name"] for j in jobs for s in j["steps"] if s["result"] == "failure"]
    successes = [s["name"] for j in jobs for s in j["steps"] if s["result"] == "success"]
    codes = [classify_error(s) for s in failing]
    return {"run_id": run_id, "workflow": raw.get("name"), "event": raw.get("event"),
            "head_sha": raw.get("head_sha"), "head_branch": raw.get("head_branch"),
            "created_at": raw.get("created_at"), "finished_at": raw.get("updated_at"),
            "result": raw.get("conclusion"), "url": raw.get("html_url"),
            "jobs": jobs, "failed_steps": failing, "passed_steps": successes,
            "error_codes": codes,
            "artifacts": [{"name": a.get("name"), "size_bytes": a.get("size_in_bytes"),
                           "expired": a.get("expired"), "artifact_id": a.get("id")}
                          for a in assets.get("artifacts", [])]}


def classify_error(step_name: str) -> str:
    known = {
        "Apply launcher-icon fix and version 0.1.7": "PRUEBAS_DE_VERSION_EN_ORDEN_INCORRECTO",
        "Build Android APK without any signing keys": "COMPROBACION_DE_RECURSOS_APK",
        "Require original signing credentials": "FALTA_FIRMA_ANDROID_ORIGINAL",
        "Sign APK using original certificate": "FIRMA_ANDROID_NO_VERIFICADA",
        "Test Android 14 upgrade without deleting data": "ACTUALIZACION_ANDROID14_FALLIDA",
        "Publish signed APK and verify public bytes": "DESCARGA_APK_NO_VERIFICADA",
        "Sign Frontera update manifest with ORIGINAL RSA key": "MANIFIESTO_RSA_NO_VERIFICADO",
        "Promote only authenticated Frontera channel and verify": "CANAL_DE_ACTUALIZACION_NO_VERIFICADO",
    }
    return known.get(step_name, "FALLO_DE_ETAPA_NO_CLASIFICADO")


def run_has_step(run: dict, name: str) -> bool:
    return name in run.get("passed_steps", [])


def read_public_channel(repo: str) -> dict:
    raw = gh_api(f"repos/{repo}/contents/frontera-de-fuego/channel.json?ref=main")
    txt = base64.b64decode(raw["content"]).decode("utf-8")
    envelope = json.loads(txt)
    payload = json.loads(envelope["payload"])
    if payload.get("package") != PACKAGE or not envelope.get("signature"):
        raise ValueError("Live signed channel package/signature invalid or missing")
    if not re.fullmatch(r"[0-9a-f]{64}", str(payload.get("sha256", ""))):
        raise ValueError("Live signed channel has no valid APK hash")
    return {"version": payload["version"], "version_code": payload["version_code"],
            "apk_sha256": payload["sha256"], "url": payload["apk_url"],
            "status": "canal_anunciado_no_certifica_telefono"}


def compute_summary(runs: list[dict], channel: dict, previous: dict | None = None) -> dict:
    previous = previous or {}
    ordered = sorted(runs, key=lambda r: (r.get("finished_at") or "", r["run_id"]))
    good_build = previous.get("ultimo_build_compilado_correcto")
    good_release = previous.get("ultima_publicacion_verificada_ci")
    counts = collections.Counter()
    errors = {}
    for r in ordered:
        counts[str(r["result"])] += 1
        if any(run_has_step(r, s) for s in BUILD_STEPS):
            # Never mistake a signed-release failure for a build failure.
            candidate = {"run_id": r["run_id"], "fecha": r["finished_at"],
                         "version": "0.1.7", "url": r["url"],
                         "alcance": "compilacion_aprobada_no_equivale_a_apk_firmada"}
            if not good_build or (candidate["fecha"] or "") >= (good_build.get("fecha") or ""):
                good_build = candidate
        for step, code in zip(r.get("failed_steps", []), r.get("error_codes", [])):
            entry = errors.setdefault(code, {"codigo": code, "ocurrencias": 0,
                                             "primer_run": r["run_id"], "ultimo_run": r["run_id"],
                                             "etapas": [], "url_ultimo": r["url"]})
            entry["ocurrencias"] += 1
            entry["ultimo_run"] = r["run_id"]
            entry["url_ultimo"] = r["url"]
            if step not in entry["etapas"]:
                entry["etapas"].append(step)
        # Only promote after every signing/testing/publication stage succeeded.
        if r.get("result") == "success" and all(run_has_step(r, step) for step in RELEASE_STEPS):
            # Live channel and published assets must be consistent before promotion.
            if channel.get("version") == "0.1.7" and channel.get("version_code") == 8:
                candidate = {"version": "0.1.7", "run_id": r["run_id"],
                             "fecha": r["finished_at"], "url": r["url"],
                             "sha256": channel["apk_sha256"],
                             "alcance": "CI_firma_android14_descarga_publica_canal_RSA"}
                if not good_release or (candidate["fecha"] or "") >= (good_release.get("fecha") or ""):
                    good_release = candidate
    return {
        "schema": 1, "proyecto": "FRONTERA DE FUEGO", "paquete": PACKAGE,
        "corridas_registradas": len(ordered), "resultados": dict(counts),
        "ultimo_build_compilado_correcto": good_build,
        "ultima_publicacion_verificada_ci": good_release,
        "canal_publico_actual": channel,
        "prueba_en_telefono_fisico": "PENDIENTE_NO_CERTIFICADA",
        "incidentes_agrupados": sorted(errors.values(), key=lambda e: (-e["ocurrencias"], e["codigo"])),
        "politica": "NO REGRESION: conservar ultimo release validado; fallos no actualizan canal ni borran partidas"}


def format_report(summary: dict, runs: list[dict]) -> str:
    build = summary.get("ultimo_build_compilado_correcto") or {}
    signed = summary.get("ultima_publicacion_verificada_ci") or {}
    channel = summary["canal_publico_actual"]
    out = ["# FRONTERA DE FUEGO | Auditoría técnica", "",
           "Registro generado a partir de la API de GitHub Actions. No contiene secretos ni logs completos.", "",
           f"**Corridas registradas:** {summary['corridas_registradas']}.",
           f"**Última compilación aprobada:** {build.get('version', 'ninguna')} (run {build.get('run_id', 'sin verificar')}).",
           f"**Última publicación aprobada por todos los controles CI:** {signed.get('version', 'ninguna')}",
           f"**Canal público observado:** {channel.get('version', 'desconocida')} (solo versión anunciada).",
           "**Prueba real en teléfono:** pendiente, NO certificada.", "",
           "## Historial de ejecuciones (se preservan los errores)", "",
           "| Run | Resultado | Compiló | Etapa fallida | Referencia |", "|---|---|---|---|---|"]
    for r in sorted(runs, key=lambda x: x["run_id"]):
        step = ", ".join(r.get("failed_steps", [])) or "ninguna"
        compiled = "sí" if any(run_has_step(r, s) for s in BUILD_STEPS) else "no"
        out.append(f"| {r['run_id']} | {r['result']} | {compiled} | {step} | [GitHub Actions]({r['url']}) |")
    out += ["", "## Fallos agrupados (para no repetir diagnósticos)", ""]
    for err in summary["incidentes_agrupados"]:
        out.append(f"- **{err['codigo']}**: {err['ocurrencias']} ocasión(es), último run {err['ultimo_run']}; {', '.join(err['etapas'])}.")
    out += ["", "## Reglas", "",
            "1. Cada ejecución conserva pasos, resultado, artefactos, SHA del código y URL en `runs/<id>.json`.",
            "2. Los errores se clasifican y agrupan, sin borrar el historial de fallos.",
            "3. Una compilación válida no implica APK firmada ni instalación exitosa.",
            "4. Un canal firmado anunciado no demuestra que la app sea segura ni que Play Protect esté conforme.",
            "5. Nunca actualizar un registro de publicación aprobada sin firma original, actualización Android 14, descarga pública y canal firmado.",
            "6. No colocar claves, contraseñas ni logs completos en el repositorio.", ""]
    return "\n".join(out)


def save_ledger(repo: str, run_ids: list[int], root: Path) -> None:
    folder = root / ROOT
    (folder / "runs").mkdir(parents=True, exist_ok=True)
    for run_id in sorted(set(run_ids)):
        data = fetch_run(repo, run_id)
        path = folder / "runs" / f"{run_id}.json"
        # Preserve immutable first observed snapshot once completed.
        if not path.exists():
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    runs = [json.loads(p.read_text(encoding="utf-8"))
            for p in (folder / "runs").glob("*.json") if p.stem.isdigit()]
    channel = read_public_channel(repo)
    current_path = folder / "estado.json"
    previous = json.loads(current_path.read_text()) if current_path.exists() else {}
    summary = compute_summary(runs, channel, previous)
    current_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (folder / "RESUMEN.md").write_text(format_report(summary, runs), encoding="utf-8")
    # Portable JSONL for independent filtering by run, failure, result or version.
    (folder / "historial.jsonl").write_text("".join(json.dumps(r, ensure_ascii=False,
       separators=(",", ":")) + "\n" for r in sorted(runs, key=lambda e:e["run_id"])), encoding="utf-8")
    print(f"AUDIT_OK runs={len(runs)} channel={channel['version']} build="
          f"{(summary.get('ultimo_build_compilado_correcto') or {}).get('version', 'none')} signed="
          f"{(summary.get('ultima_publicacion_verificada_ci') or {}).get('version','none')}")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--run-id", type=int, action="append", default=[])
    p.add_argument("--bootstrap", action="store_true")
    p.add_argument("--root", type=Path, default=Path.cwd())
    args = p.parse_args()
    ids = list(args.run_id)
    if args.bootstrap:
        ids += list(BASELINE_RUNS)
    if not ids:
        raise SystemExit("No run ids; refuse empty/misleading audit")
    save_ledger(os.environ.get("GITHUB_REPOSITORY", REPOSITORY), ids, args.root)


if __name__ == "__main__":
    main()