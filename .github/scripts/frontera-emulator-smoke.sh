#!/usr/bin/env bash
set -euo pipefail
APK=app/build/FRONTERA_0.1.3_CI_X86_EMULATOR.apk
PKG=cl.nazaret.fronteradefuego
adb install "$APK"
# Suprimir aviso de modo inmersivo del sistema en entorno automatizado.
adb shell settings put secure immersive_mode_confirmations confirmed || true
adb shell settings put global window_animation_scale 0 || true
adb shell settings put global transition_animation_scale 0 || true
adb logcat -c
adb shell am force-stop "$PKG"
adb shell am start -W -n "$PKG/com.godot.game.GodotApp"
sleep 12
adb shell dumpsys window > emulator-windows.txt
adb shell dumpsys activity activities > emulator-activities.txt
adb shell screencap -p /sdcard/frontera-ci.png
adb pull /sdcard/frontera-ci.png frontera-emulator.png
adb logcat -d > emulator-logcat.txt
grep -F 'FRONTERA: menu principal visible (ready)' emulator-logcat.txt
grep -F 'topResumedActivity=' emulator-activities.txt | grep "$PKG"
if grep -E 'mCurrentFocus=.*(ImmersiveModeConfirmation|Launcher)' emulator-windows.txt; then
  echo 'ERROR: pantalla bloqueada por dialogo del sistema o launcher'
  exit 1
fi
if grep -E 'Condition "!_start_success"|FATAL EXCEPTION|CanvasShaderGLES3: Program linking failed' emulator-logcat.txt; then
  echo 'ERROR: fallo de motor o renderer detectado'
  exit 1
fi
python3 -m pip install --user -q Pillow
python3 .github/scripts/frontera-screenshot-check.py
