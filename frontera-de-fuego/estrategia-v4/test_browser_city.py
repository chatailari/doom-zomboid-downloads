from playwright.sync_api import sync_playwright
from pathlib import Path
ROOT=Path(__file__).parent
html=(ROOT/'juego_offline.html').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':393,'height':852},device_scale_factor=1,has_touch=True,is_mobile=True)
 page.set_default_timeout(4000)
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 # Stable in-memory storage mock because container browser blocks local/file URLs.
 page.evaluate('''() => {window.__save={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem(k){return window.__save[k]??null},setItem(k,v){window.__save[k]=String(v)},removeItem(k){delete window.__save[k]}}});}''')
 page.set_content(html,wait_until='domcontentloaded')
 page.get_by_role('button',name='FUNDAR ASENTAMIENTO Y COMENZAR').click()
 assert page.locator('#year').inner_text()=='1541'
 assert '38/50' in page.locator('#town-stats').inner_text()
 assert page.locator('#town-scene .built').count()==2
 page.locator('[data-build="viviendas"]').click()
 assert page.locator('#town-scene .built').count()==3
 page.locator('#season-button').click()
 assert '1/8' in page.locator('#town-stats').inner_text()
 assert '40/72' in page.locator('#town-stats').inner_text()
 saved=page.evaluate("window.__save['frontera_defuego_ciudades_v4']")
 assert saved and 'viviendas' in saved
 # Replacing DOM is equivalent to reloading page for this self-contained HTML.
 page.close()
 page=browser.new_page(viewport={'width':393,'height':852},device_scale_factor=1,has_touch=True,is_mobile=True)
 page.set_default_timeout(4000)
 page.on('pageerror',lambda e:errors.append(str(e)))
 import json
 page.evaluate('''data => {window.__save={'frontera_defuego_ciudades_v4':data};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem(k){return window.__save[k]??null},setItem(k,v){window.__save[k]=String(v)},removeItem(k){delete window.__save[k]}}});}''',saved)
 page.set_content(html,wait_until='domcontentloaded')
 page.get_by_role('button',name='CONTINUAR PARTIDA GUARDADA').click()
 assert page.locator('#town-scene .built').count()==3
 assert '1/8' in page.locator('#town-stats').inner_text()
 for i in range(60):
  if page.locator('#advance').count():break
  if page.locator('[data-prepare="recruit"]').is_enabled():page.locator('[data-prepare="recruit"]').click()
  page.locator('#fight').click()
 assert page.locator('#advance').count()==1
 page.locator('#advance').click()
 assert page.locator('#year').inner_text()=='1550'
 assert page.locator('#town-scene .built').count()==3
 assert '0/8' in page.locator('#town-stats').inner_text()
 assert page.locator('.epoch.locked').count()==5
 assert not errors,errors
 page.screenshot(path=str(ROOT/'mobile_city_v4.png'),full_page=True)
 browser.close()
print('PASS: mobile construction, turns, save & resume, chronology 1541 to 1550, no JS errors')