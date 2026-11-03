from playwright.sync_api import sync_playwright
from pathlib import Path
base='file:///mnt/data/frontera_de_fuego_v2/index.html'
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':412,'height':915},device_scale_factor=1,is_mobile=True,has_touch=True)
 errors=[]
 page.on('pageerror',lambda err: errors.append(str(err)))
 page.set_content(Path('/mnt/data/frontera_de_fuego_v2/juego_offline.html').read_text(),wait_until='load')
 print('welcome',page.locator('#welcome').get_attribute('class'))
 page.locator('#tab-independencia').click()
 assert page.locator('#scenario-description').inner_text().startswith('La Patria Vieja')
 page.locator('button[data-faction=patriotas]').click()
 print('state',page.locator('#campaign-label').inner_text(), 'year',page.locator('#year').inner_text())
 assert page.locator('#year').inner_text()=='1810'
 page.locator('button[data-id=mapocho]').first.click()
 page.locator('#recruit').click()
 assert '3/4' in page.locator('#orders-badge').inner_text()
 page.locator('#research').click()
 page.locator('button[data-tech=tactics]').click()
 assert '2/4' in page.locator('#orders-badge').inner_text()
 page.locator('#next').click()
 assert page.locator('#year').inner_text()=='1811'
 page.locator('#save').click()
 assert page.locator('#save-modal').get_attribute('class').endswith('open')
 page.locator('#close-save').click()
 page.screenshot(path='/mnt/data/frontera_de_fuego_v2/mobile_game.png',full_page=True)
 # La navegación real queda bloqueada en este entorno. Validamos guardado vía pruebas unitarias de import/export.
 page.locator('#home').click()
 page.locator('#tab-arauco').click()
 page.on('dialog',lambda dialog:dialog.accept())
 page.locator('button[data-faction=mapuche]').click()
 assert page.locator('#year').inner_text()=='1541'
 page.locator('button[data-id=biobio]').first.click()
 assert not page.locator('#auto').is_disabled() # tucapel neighbor biobio
 page.locator('#fps').click()
 assert page.locator('#fps-modal').get_attribute('class').endswith('open')
 page.locator('#fire').click()
 page.locator('#leave-fps').click()
 assert 'open' not in page.locator('#fps-modal').get_attribute('class')
 print('errors',errors)
 assert not errors,errors
 b.close()
print('BROWSER TEST: PASS')