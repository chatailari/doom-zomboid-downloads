from playwright.sync_api import sync_playwright
from pathlib import Path
import subprocess, time
ROOT=Path(__file__).parent
server=subprocess.Popen(['python','-m','http.server','8947','--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  page=browser.new_page(viewport={'width':393,'height':852},device_scale_factor=1,has_touch=True,is_mobile=True)
  errors=[]
  page.on('pageerror',lambda e: errors.append(str(e)))
  page.set_content((ROOT/'juego_offline.html').read_text(encoding='utf-8'),wait_until='domcontentloaded')
  page.wait_for_timeout(300)
  page.get_by_role('button',name='COMENZAR PRIMER EPISODIO').click()
  assert page.locator('#year').inner_text()=='1541'
  assert page.locator('.epoch.locked').count()==6
  assert 'Santiago en llamas' in page.locator('#chapter-title').inner_text()
  before=page.locator('#chance').inner_text()
  page.locator('[data-prepare=recruit]').click()
  after=page.locator('#chance').inner_text()
  assert int(after[:-1])>=int(before[:-1])
  page.locator('#fight').click()
  assert page.locator('#outcome').is_visible()
  # If the attack fails, keep going with reinforcements, without resetting the game.
  for i in range(40):
   if page.locator('#advance').count():break
   if page.locator('[data-prepare=recruit]').is_enabled():page.locator('[data-prepare=recruit]').click()
   page.locator('#fight').click()
  assert page.locator('#advance').count()==1
  page.screenshot(path=str(ROOT/'mobile_story_v3.png'),full_page=True)
  page.locator('#advance').click()
  assert page.locator('#year').inner_text()=='1550'
  assert page.locator('.epoch.locked').count()==5
  assert not errors,errors
  assert (ROOT/'clasico.html').read_text(encoding='utf-8').find('frontera_defuego_estrategia_save_v2')>=0
  browser.close()
 print('BROWSER PASS: 1541->1550, capítulos bloqueados, preparación, victoria, modo libre preservado, sin errores JS')
finally:server.terminate();server.wait()