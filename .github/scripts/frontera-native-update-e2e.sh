#!/usr/bin/env bash
set -euo pipefail
PKG=cl.nazaret.fronteradefuego
adb install ci/native-v4-debug.apk
adb shell am start -W -n "$PKG/.LauncherActivity"
sleep 4
adb shell uiautomator dump /sdcard/native-v4-ui.xml >/dev/null
adb pull /sdcard/native-v4-ui.xml native-v4-ui.xml
python3 - <<'PY'
import xml.etree.ElementTree as ET,re,subprocess
root=ET.parse('native-v4-ui.xml').getroot()
for node in root.iter('node'):
 if node.attrib.get('text')=='ELEGIR BANDO':
  a,b,c,d=map(int,re.findall(r'\d+',node.attrib['bounds']))
  subprocess.run(['adb','shell','input','tap',str((a+c)//2),str((b+d)//2)],check=True)
  break
else:raise SystemExit('ELEGIR BANDO no disponible')
PY
sleep 2
adb shell uiautomator dump /sdcard/native-sides.xml >/dev/null
adb pull /sdcard/native-sides.xml native-sides.xml
python3 - <<'PY'
import xml.etree.ElementTree as ET,re,subprocess
root=ET.parse('native-sides.xml').getroot()
for node in root.iter('node'):
 if node.attrib.get('text')=='Corona española':
  a,b,c,d=map(int,re.findall(r'\d+',node.attrib['bounds']))
  subprocess.run(['adb','shell','input','tap',str((a+c)//2),str((b+d)//2)],check=True)
  break
else:raise SystemExit('Opcion de bando no disponible')
PY
sleep 1
adb shell run-as "$PKG" cat shared_prefs/frontera.xml | tee native-before.xml
grep -q 'Corona española' native-before.xml
adb shell uiautomator dump /sdcard/native-v4-ui2.xml >/dev/null
adb pull /sdcard/native-v4-ui2.xml native-v4-ui2.xml
python3 - <<'PY'
import xml.etree.ElementTree as ET,re,subprocess
root=ET.parse('native-v4-ui2.xml').getroot()
for node in root.iter('node'):
 if node.attrib.get('text')=='ACTUALIZAR':
  a,b,c,d=map(int,re.findall(r'\d+',node.attrib['bounds']))
  subprocess.run(['adb','shell','input','tap',str((a+c)//2),str((b+d)//2)],check=True)
  break
else:raise SystemExit('Boton ACTUALIZAR no visible')
PY
sleep 8
adb shell uiautomator dump /sdcard/native-dialog-update.xml >/dev/null
adb pull /sdcard/native-dialog-update.xml native-dialog-update.xml
adb shell screencap -p /sdcard/native-update-detect.png
adb pull /sdcard/native-update-detect.png native-update-detect.png
if ! grep -q 'NUEVA APK DISPONIBLE' native-dialog-update.xml; then
  echo 'ERROR: No detectó actualización 0.1.4 desde versión 0.1.3'
  exit 1
fi
echo 'PASS: botón actualizador vio la versión 0.1.4 firmada'
adb install -r ci/native-v5-debug.apk
adb shell am force-stop "$PKG"
adb shell am start -W -n "$PKG/.LauncherActivity"
sleep 4
adb shell run-as "$PKG" cat shared_prefs/frontera.xml | tee native-after.xml
grep -q 'Corona española' native-after.xml
adb shell dumpsys package "$PKG" | grep -E 'versionCode=5'
adb shell screencap -p /sdcard/native-upgrade-finished.png
adb pull /sdcard/native-upgrade-finished.png native-upgrade-finished.png
echo 'PASS: actualización APK 4→5 sin perder preferencias'
