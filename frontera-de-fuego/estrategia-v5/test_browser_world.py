from playwright.sync_api import sync_playwright
from pathlib import Path
ROOT=Path(__file__).parent
html=(ROOT/'juego_offline.html').read_text(encoding='utf-8')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':393,'height':852},device_scale_factor=1,has_touch=True,is_mobile=True)
 page.set_default_timeout(5000)
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.evaluate('''() => {window.__save={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem(k){return window.__save[k]??null},setItem(k,v){window.__save[k]=String(v)},removeItem(k){delete window.__save[k]}}});}''')
 page.set_content(html,wait_until='domcontentloaded')
 page.get_by_role('button',name='FUNDAR ASENTAMIENTO Y COMENZAR').click()
 assert page.locator('#year').inner_text()=='1541'
 assert page.locator('#town-scene .world-cell').count()==120
 assert page.locator('#town-scene .has-building').count()==2
 assert '38/50' in page.locator('#town-stats').inner_text()
 page.screenshot(path=str(ROOT/'mobile_map_v5.png'),full_page=True)
 # Build a dwelling on a compatible empty tile
 page.locator('#quick-builds [data-build="viviendas"]').click()
 assert 'Construyendo' in page.locator('#selection-info').inner_text()
 available=page.locator('.world-cell.can-build').first
 assert available.count()==1
 available.click()
 assert page.locator('#town-scene .has-building').count()==3
 assert '38/72' in page.locator('#town-stats').inner_text()
 # Gather wood from forest
 forest=page.locator('.world-cell.terrain-forest:not(.has-building)').first
 forest.click()
 assert page.get_by_role('button',name='🪓 Cortar madera').count()==1
 before=page.evaluate("JSON.parse(window.__save.frontera_defuego_mundo_v5).wood")
 page.get_by_role('button',name='🪓 Cortar madera').click()
 after=page.evaluate("JSON.parse(window.__save.frontera_defuego_mundo_v5).wood")
 assert after>before,(after,before)
 # 1 season advances; keeps constructions
 page.locator('#season-button').click()
 assert '1/8' in page.locator('#town-stats').inner_text()
 assert page.locator('#town-scene .has-building').count()==3
 saved=page.evaluate("window.__save['frontera_defuego_mundo_v5']")
 assert saved and '"world"' in saved
 page.close()
 # Resume saved v5
 page=browser.new_page(viewport={'width':393,'height':852},device_scale_factor=1,has_touch=True,is_mobile=True)
 page.set_default_timeout(5000)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.evaluate('''data => {window.__save={'frontera_defuego_mundo_v5':data};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem(k){return window.__save[k]??null},setItem(k,v){window.__save[k]=String(v)},removeItem(k){delete window.__save[k]}}});}''',saved)
 page.set_content(html,wait_until='domcontentloaded')
 page.get_by_role('button',name='CONTINUAR PARTIDA GUARDADA').click()
 assert page.locator('#town-scene .has-building').count()==3
 assert '1/8' in page.locator('#town-stats').inner_text()
 # Historical story still advances, keeping town
 for i in range(80):
  if page.locator('#advance').count():break
  if page.locator('[data-prepare="recruit"]').is_enabled():page.locator('[data-prepare="recruit"]').click()
  page.locator('#fight').click()
 assert page.locator('#advance').count()==1
 page.locator('#advance').click()
 assert page.locator('#year').inner_text()=='1550'
 assert page.locator('#town-scene .has-building').count()==3
 assert '0/8' in page.locator('#town-stats').inner_text()
 assert not errors,errors
 page.screenshot(path=str(ROOT/'mobile_map_v5_saved.png'),full_page=True)
 browser.close()
print('PASS: 120-parcel world, placement, lumberjacks, season, save/resume, chapter unlock, no JS errors')