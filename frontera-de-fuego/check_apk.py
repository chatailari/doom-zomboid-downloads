#!/usr/bin/env python3
"""Gate de publicación FRONTERA: inspección estática de APK, no prueba Android."""
import hashlib
import json
import sys
import zipfile

REQUIRED = "assets/assets/update_public.pem"
EXPECTED_PACKAGE = "cl.nazaret.fronteradefuego"

def check(apk_path):
    errors = []
    with open(apk_path, "rb") as stream:
        sha256 = hashlib.file_digest(stream, "sha256").hexdigest()
    with zipfile.ZipFile(apk_path) as apk:
        if apk.testzip() is not None:
            errors.append("ZIP APK dañado")
        files = set(apk.namelist())
        if REQUIRED not in files:
            errors.append("Falta la clave publica de actualizacion: " + REQUIRED)
        if "assets/project.binary" not in files:
            errors.append("No hay configuracion Godot exportada")
        else:
            cfg = apk.read("assets/project.binary")
            if b"gl_compatibility" not in cfg:
                errors.append("Renderizador movil no comprobado: gl_compatibility ausente")
        if "assets/releases/channel.json" in files:
            channel = json.loads(apk.read("assets/releases/channel.json"))
            payload = json.loads(channel["payload"])
            if payload["package"] != EXPECTED_PACKAGE:
                errors.append("Package ID inesperado en el canal embebido")
            if payload.get("version_code", -1) < 0:
                errors.append("version_code invalido")
        else:
            errors.append("Falta canal embebido")
    print(json.dumps({"apk":apk_path,"sha256":sha256,"aprobado":not errors,
                      "bloqueos":errors}, indent=2))
    return int(bool(errors))

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python check_apk.py ruta/al/archivo.apk",file=sys.stderr)
        sys.exit(2)
    sys.exit(check(sys.argv[1]))
