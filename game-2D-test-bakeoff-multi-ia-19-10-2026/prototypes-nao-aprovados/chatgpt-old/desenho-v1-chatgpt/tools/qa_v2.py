from pathlib import Path
import asyncio,json,threading,base64
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from playwright.async_api import async_playwright
BASE=Path(__file__).resolve().parent.parent
EVID=BASE/'evidence';EVID.mkdir(exist_ok=True)
async def main():
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(BASE)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--disable-web-security','--no-sandbox','--allow-file-access-from-files'])
  page=await browser.new_page(viewport={'width':1450,'height':1100},device_scale_factor=1)
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  await page.set_content((BASE/'index.html').read_text(encoding='utf8'),wait_until='domcontentloaded')
  await page.wait_for_timeout(900)
  before=await page.evaluate('document.getElementById("hero").toDataURL("image/png")')
  await page.evaluate('window.paintHero()')
  after=await page.evaluate('document.getElementById("hero").toDataURL("image/png")')
  deterministic=before==after
  await page.set_input_files('#chooseRef',str(BASE/'reference-preview'/'hero-idle-s-user.png'))
  await page.wait_for_timeout(700)
  print('Reference loaded:',await page.locator('#reference').evaluate('(el)=>el.complete && el.naturalWidth > 0'))
  cases=[('neutral','S','v2-idle-S.png'),('neutral','SE','v2-idle-SE.png'),('run','S','v2-run-S.png'),('attack','S','v2-attack-S.png')]
  out=[]
  for pose,orientation,name in cases:
   await page.select_option('#pose',pose);await page.select_option('#orientation',orientation)
   await page.wait_for_timeout(180)
   await page.screenshot(path=str(EVID/name))
   m=await page.evaluate('window.__verifyProcedural()');out.append({'case':name,'metrics':m})
  await page.select_option('#mode','solo');await page.select_option('#pose','neutral');await page.select_option('#view','hero');await page.select_option('#orientation','S');await page.wait_for_timeout(80)
  data=await page.evaluate('document.getElementById("hero").toDataURL("image/png")')
  (EVID/'v2-procedural-canvas.png').write_bytes(base64.b64decode(data.split(',')[1]))
  print(json.dumps({'errors':errors,'deterministic':deterministic,'reference_loaded':await page.locator('#reference').evaluate('(el)=>el.complete && el.naturalWidth > 0'),'tests':out},indent=2)[:9000]);
  await browser.close()
 server.shutdown()
asyncio.run(main())
