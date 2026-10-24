from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image
import json,hashlib,platform,base64
folder=Path(__file__).parent
shot=folder/'screenshots';shot.mkdir(exist_ok=True)
html=(folder/'index-rig.html').read_bytes()
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1280,'height':720},device_scale_factor=1)
 errors=[];consoleerrors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('console',lambda m:consoleerrors.append(m.text) if m.type=='error' else None)
 page.set_content(html.decode(),wait_until='load');page.wait_for_function('!!window.RIG01')
 def image(name,cmd):
  data=page.evaluate('''(cmd)=>{const a=RIG01;a.setPaused(true);eval(cmd);return a.capturePNG()}''',cmd)
  img=base64.b64decode(data.partition(',')[2]);(shot/name).write_bytes(img)
  return list(Image.open(shot/name).size)
 images={
 '01-idle-back-X-south.png':image('01-idle-back-X-south.png',"a.setMode('arena');a.setState('idle');a.setWeaponsDrawn(false);a.setYaw(0);a.setTime(.48)"),
 '02-idle-back-X-north.png':image('02-idle-back-X-north.png',"a.setMode('arena');a.setState('idle');a.setWeaponsDrawn(false);a.setYaw(180);a.setTime(.48)"),
 '03-combat-guard.png':image('03-combat-guard.png',"a.setMode('arena');a.setState('idle');a.setWeaponsDrawn(true);a.setYaw(135);a.setTime(.48)"),
 '04-run.png':image('04-run.png',"a.setMode('arena');a.setState('run');a.setWeaponsDrawn(false);a.setYaw(45);a.setTime(.23)"),
 '05-roll.png':image('05-roll.png',"a.setMode('arena');a.setState('roll');a.setYaw(45);a.setTime(.23)"),
 '06-dash.png':image('06-dash.png',"a.setMode('arena');a.setState('dash');a.setYaw(45);a.setTime(.16)"),
 '07-attack-1.png':image('07-attack-1.png',"a.setMode('arena');a.setState('attack1');a.setYaw(45);a.setTime(.12)"),
 '08-attack-3.png':image('08-attack-3.png',"a.setMode('arena');a.setState('attack3');a.setYaw(45);a.setTime(.23)"),
 '09-contact-56.png':image('09-contact-56.png',"a.setMode('contact')"),
 '10-motion-phases.png':image('10-motion-phases.png',"a.setMode('motion')")}
 result=page.evaluate('''() => {
 const a=RIG01,len=(p,q)=>Math.hypot(p.x-q.x,p.y-q.y,p.z-q.z);let violations=[],reach=[],comparisons=0,shoulderInside=[];
 for(const s of ['idle','run','dash','roll','attack1','attack2','attack3'])for(const yaw of [0,45,90,135,180,225,270,315])for(const frac of [.05,.2,.4,.65,.9]){
    a.setMode('arena');a.setState(s);a.setYaw(yaw);a.setTime((({idle:2,run:.65,dash:.42,roll:.66,attack1:.34,attack2:.35,attack3:.56})[s]) *frac);
    const z=a.getDebugInfo(),j=z.joints;
    for(const side of ['L','R'])for(const [u,w,k] of [['hip'+side,'knee'+side,.34],['knee'+side,'ankle'+side,.34],['shoulder'+side,'elbow'+side,.26],['elbow'+side,'wrist'+side,.24]]){const n=len(j[u],j[w]);comparisons++;if(Math.abs(n-k)>.0001)violations.push({s,yaw,frac,u,w,n,k});}
    if(z.ikReachErrors.length)reach.push({s,yaw,frac,errors:z.ikReachErrors});
 }
 a.reset();const foot0=a.runFootLockTest(2,0),foot90=a.runFootLockTest(2,90);
 a.reset();a.setPaused(true);a.triggerAction('dash');a.step(.43);const dash={distance:a.getMetrics().root.y,state:a.getState()};
 a.reset();a.setPaused(true);a.triggerAction('roll');a.step(.68);const roll={distance:a.getMetrics().root.y,armed:a.getMetrics().weaponsDrawn,guard:a.getMetrics().combatTimer,state:a.getState()};
 a.reset();a.setPaused(true);a.triggerAction('attack');a.step(.17);a.triggerAction('attack');a.step(.06);const chain2=a.getState();a.step(.17);a.triggerAction('attack');a.step(.02);const chain3=a.getState();
 a.reset();a.setPaused(true);a.triggerAction('attack');a.step(.35);const armedAfterAttack=a.getMetrics();a.step(3.4);const beforeSheath=a.getMetrics();a.step(.12);const afterSheath=a.getMetrics();
 a.reset();a.setPaused(true);a.setState('idle');a.setWeaponsDrawn(false);let back=a.getDebugInfo();let rear=back.depths.filter(e=>e.name.startsWith('backBlade')).length;
 a.setWeaponsDrawn(true);a.setPaused(true);a.step(.20);let inHand=a.getDebugInfo();let wield=inHand.depths.filter(e=>e.name.startsWith('curvedBlade')).length;
 a.reset();a.setPaused(true);a.setMode('contact');const contact=[document.getElementById('stage').width,document.getElementById('stage').height];a.setMode('motion');const motion=[document.getElementById('stage').width,document.getElementById('stage').height];
 return {comparisons,violations:violations.slice(0,20),reaches:reach.slice(0,20),foot0,foot90,dash,roll,chain2,chain3,armedAfterAttack,beforeSheath,afterSheath,bladesOnBack:rear,bladesInHands:wield,contact,motion,version:a.version};
}''')
 result['arm_silhouette']=page.evaluate("""() => {let bad=[],count=0;for(const st of ['idle','run','dash','attack1','attack2'])for(const deg of [0,45,90,135,180,225,270,315])for(const frac of [.05,.2,.4,.65,.9]){RIG01.setState(st);RIG01.setYaw(deg);RIG01.setTime(({idle:2,run:.65,dash:.42,attack1:.34,attack2:.35})[st]*frac);let j=RIG01.getDebugInfo().joints,a=deg*Math.PI/180;for(const [side,sign] of [['L',1],['R',-1]]){let shoulder=j['shoulder'+side],elbow=j['elbow'+side],dx=elbow.x-shoulder.x,dy=elbow.y-shoulder.y,sideX=dx*Math.cos(a)-dy*Math.sin(a);count++;if(sideX*sign<-.035)bad.push({st,deg,frac,side,sideX})}}return {samples:count,violations:bad.length,examples:bad.slice(0,5)}}""")
 page.evaluate('RIG01.reset();RIG01.setMode("arena");RIG01.setPaused(false);')
 page.keyboard.press('f');page.wait_for_timeout(160)
 result['F_is_roll']=page.evaluate('RIG01.getState()')
 page.evaluate('RIG01.reset();RIG01.setPaused(false)')
 page.keyboard.press('x');page.wait_for_timeout(50)
 result['X_equips']=page.evaluate('RIG01.getMetrics().weaponsDrawn')
 page.keyboard.press('q');page.wait_for_timeout(50)
 result['Q_sheathes']=not page.evaluate('RIG01.getMetrics().weaponsDrawn')
 page.evaluate('RIG01.reset();RIG01.setPaused(false)')
 page.keyboard.press('w',delay=30);page.wait_for_timeout(100);page.keyboard.press('w',delay=30);page.wait_for_timeout(100)
 result['doubleTap_W_is_dash']=page.evaluate('RIG01.getState()')
 page.evaluate('RIG01.reset();RIG01.setPaused(false)')
 page.keyboard.press('Shift');page.wait_for_timeout(100)
 result['Shift_is_dash']=page.evaluate('RIG01.getState()')
 page.evaluate('RIG01.reset();RIG01.setPaused(false)');page.wait_for_timeout(1000)
 result['observed_fps']=page.evaluate('RIG01.getMetrics().fps')
 result['errors']=errors;result['consoleerrors']=consoleerrors;result['screenshots']=images
 result['source_sha256']=hashlib.sha256(html).hexdigest();result['browser']=page.evaluate('navigator.userAgent')
 result['system']=platform.platform()
 (folder/'qa_results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
 print(json.dumps({k:v for k,v in result.items() if k not in ('screenshots','browser','system')},ensure_ascii=False,indent=2)[:12500])
 browser.close()
