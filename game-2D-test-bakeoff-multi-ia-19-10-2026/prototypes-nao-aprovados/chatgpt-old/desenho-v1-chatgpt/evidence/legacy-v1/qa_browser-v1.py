"""Reproduz capturas reais em Chromium sem depender de acesso de rede na sandbox.
Executa HTML carregado em memória e bundle ESM concatenado apenas para validação.
Não altera o código e não usa o PNG oficial como renderer.
Uso: python evidence/qa_browser.py  (requer playwright e chromium).
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re,json,hashlib
root=Path(__file__).resolve().parents[1]
parts=['geometry','materials','head','body','weapons','hero','app']
html=(root/'index.html').read_text().replace('<script type="module" src="./src/app.js"></script>','')
code='\n'.join(re.sub(r'^export \{.*?\};?\s*$','',re.sub(r'^export\s+','',re.sub(r'^import .*?;\s*$','',(root/'src'/f'{part}.js').read_text(),flags=re.M),flags=re.M),flags=re.M) for part in parts)
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1510,'height':1300},device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('console',lambda msg:errors.append(msg.text) if msg.type=='error' else None)
    page.set_content(html,wait_until='domcontentloaded')
    page.add_script_tag(content=code)
    before=page.locator('#hero').evaluate('(el)=>el.toDataURL("image/png")')
    page.evaluate('window.paintHero()')
    after=page.locator('#hero').evaluate('(el)=>el.toDataURL("image/png")')
    assert before==after,'Dessincronização de textura ou renderização não determinística.'
    assert not errors,f'Erro em navegador: {errors}'
    print('Determinismo: OK (dois renders byte-a-byte idênticos)')
    metadata={'browser':'Chromium Headless','test_method':'set_content + injection of concatenated ESM for offline sandbox; not HTTP module loading','console_errors':errors,'deterministic':True,'screenshots':{}}
    for name,settings in {
      'hero-full':{'mode':'solo','view':'hero','scale':'1','pose':'neutral'},
      'hero-gameplay':{'mode':'solo','view':'hero','scale':'0.45','pose':'neutral'},
      'hero-head':{'mode':'solo','view':'head','scale':'1','pose':'neutral'},
      'hero-body':{'mode':'solo','view':'body','scale':'1','pose':'neutral'},
      'hero-weapons':{'mode':'solo','view':'weapons','scale':'1','pose':'neutral'},
      'hero-pivots':{'mode':'joints','view':'hero','scale':'1','pose':'neutral'},
      'hero-tpose':{'mode':'joints','view':'hero','scale':'1','pose':'tpose'},
    }.items():
      for key,value in settings.items():page.locator('#'+key).select_option(value)
      page.wait_for_timeout(30)
      path=root/'evidence'/f'{name}.png';page.screenshot(path=str(path),full_page=True)
      metadata['screenshots'][name]={'path':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
      print(name,'render_ms',page.evaluate('window.__verifyProcedural().lastMS'))
    metadata['renderer_metrics']=page.evaluate('window.__verifyProcedural()')
    (root/'evidence'/'qa-report.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2))
    print('Console: OK; capturas reais:',len(metadata['screenshots']))
    browser.close()
