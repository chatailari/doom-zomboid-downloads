"""Crea una versión HTML independiente sin servidor ni imports de módulos."""
from pathlib import Path
root=Path(__file__).parent
page=(root/'index.html').read_text(encoding='utf-8')
sc=(root/'scenarios.mjs').read_text(encoding='utf-8')
en=(root/'engine.mjs').read_text(encoding='utf-8')
sc=sc.replace('export const ','const ').replace('export function ','function ')
lines=[]
for line in en.splitlines():
 if line.startswith('import ') or line.startswith('export {'):continue
 lines.append(line.replace('export const ','const ').replace('export function ','function '))
en='\n'.join(lines)
start=page.find('<script type="module">')
assert start!=-1
end=page.index('</script>',start)
ui=page[start+len('<script type="module">'):end]
ui='\n'.join(x for x in ui.splitlines() if not x.startswith('import '))
replaced=page[:start]+'<script>\n'+sc+'\n'+en+'\n'+ui+'\n</script>'+page[end+len('</script>'):]
assert len(replaced)>30000 and '<script type="module">' not in replaced
(root/'juego_offline.html').write_text(replaced,encoding='utf-8')
print('HTML único construido, bytes:',(root/'juego_offline.html').stat().st_size)