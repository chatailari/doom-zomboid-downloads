#!/usr/bin/env bash
set -euo pipefail
APK=native/app/build/outputs/apk/debug/app-debug.apk
PKG=cl.nazaret.fronteradefuego
adb install "$APK"
adb shell am force-stop "$PKG"
adb shell am start -W -n "$PKG/.LauncherActivity"
sleep 6
adb shell dumpsys activity activities > native-emulator-focus.txt
adb shell uiautomator dump /sdcard/native-ui.xml >/dev/null
adb pull /sdcard/native-ui.xml native-ui.xml
grep -F 'FRONTERA DE FUEGO' native-ui.xml
grep -F 'ACTUALIZAR' native-ui.xml
adb shell screencap -p /sdcard/native-home.png
adb pull /sdcard/native-home.png native-home.png
python3 - <<'PY'
import xml.etree.ElementTree as ET,re,subprocess
root=ET.parse('native-ui.xml').getroot()
for node in root.iter('node'):
 if node.attrib.get('text')=='ACTUALIZAR':
  x1,y1,x2,y2=map(int,re.findall(r'\d+',node.attrib['bounds']))
  print('PULSAR ACTUALIZAR',x1,y1,x2,y2)
  subprocess.run(['adb','shell','input','tap',str((x1+x2)//2),str((y1+y2)//2)],check=True)
  break
else:raise SystemExit('No existe boton ACTUALIZAR')
PY
sleep 7
adb shell uiautomator dump /sdcard/native-update-ui.xml >/dev/null
adb pull /sdcard/native-update-ui.xml native-update-ui.xml
adb shell screencap -p /sdcard/native-update.png
adb pull /sdcard/native-update.png native-update.png
adb logcat -d > native-logcat.txt
python3 - <<'PY'
from pathlib import Path
import xml.etree.ElementTree as ET
s=Path('native-update-ui.xml').read_text()
texts=[n.attrib.get('text','') for n in ET.fromstring(s).iter('node')]
print('ESTADOS APP:',[x for x in texts if any(q in x for q in ['APK 0.1.4','Actualización','canal oficial','actualizada'])])
assert any('FRONTERA DE FUEGO' in x for x in texts), 'App no visible tras actualizar'
print('PASS: menu Android nativo y boton ACTUALIZAR presentes y pulsados')
PY