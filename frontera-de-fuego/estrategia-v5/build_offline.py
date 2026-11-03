from pathlib import Path
root=Path(__file__).parent
page=(root/'index.html').read_text(encoding='utf-8')
def script(name):
 src=(root/name).read_text(encoding='utf-8')
 return '\n'.join(line.replace('export const ','const ').replace('export function ','function ') for line in src.splitlines() if not line.startswith('import ') and not line.startswith('export {'))
start=page.index('<script type="module">');end=page.index('</script>',start)
ui='\n'.join(line for line in page[start+len('<script type="module">'):end].splitlines() if not line.startswith('import '))
rendered=page[:start]+'<script>\n'+ '\n'.join(script(f) for f in ['scenarios.mjs','settlement.mjs','world.mjs','story.mjs'])+'\n'+ui+'\n</script>'+page[end+len('</script>'):]
assert 'import {' not in rendered and '<script type="module">' not in rendered
(root/'juego_offline.html').write_text(rendered,encoding='utf-8')
print('HTML offline',len(rendered),'chars')