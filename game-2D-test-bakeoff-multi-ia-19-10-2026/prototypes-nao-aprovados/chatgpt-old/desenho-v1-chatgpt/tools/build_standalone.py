from pathlib import Path
import re
BASE=Path(__file__).resolve().parent.parent
FILES=['geometry','materials','rig-adapter','head','body','weapons','hero','app']
parts=[]
for module in FILES:
    p=BASE/'src'/f'{module}.js'
    s=p.read_text(encoding='utf8')
    s=re.sub(r"^import .*?;\s*$",'',s,flags=re.MULTILINE)
    s=re.sub(r'^export\s+(?=(?:function|const|class)\b)','',s,flags=re.MULTILINE)
    s=re.sub(r'^export\s+\{[^}]+\};?\s*$','',s,flags=re.MULTILINE)
    parts.append('// ===== '+str(p.relative_to(BASE))+' =====\n'+s)
js="\n".join(parts).replace('</script','<\\/script')
p=BASE/'index.html'
s=p.read_text(encoding='utf8')
s=re.sub(r'(<script id="standalone-code">).*?(</script>)',lambda m: m.group(1)+'\n'+js+'\n'+m.group(2),s,flags=re.DOTALL)
p.write_text(s,encoding='utf8')
print(f'Built {p.name} self-contained: {len(s)} chars, {len(parts)} modules.')
