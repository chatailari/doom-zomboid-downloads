from pathlib import Path
root=Path(__file__).parent
page=(root/'index.html').read_text(encoding='utf-8')
sc=(root/'scenarios.mjs').read_text(encoding='utf-8')
st=(root/'story.mjs').read_text(encoding='utf-8')
sc=sc.replace('export const ','const ').replace('export function ','function ')
lines=[]
for line in st.splitlines():
 if line.startswith('import ') or line.startswith('export {'): continue
 lines.append(line.replace('export const ','const ').replace('export function ','function '))
st='\n'.join(lines)
start=page.index('<script type="module">')
end=page.index('</script>',start)
ui='\n'.join(line for line in page[start+len('<script type="module">'):end].splitlines() if not line.startswith('import '))
rendered=page[:start]+'<script>\n'+sc+'\n'+st+'\n'+ui+'\n</script>'+page[end+len('</script>'):]
assert 'import {' not in rendered and '<script type="module">' not in rendered
(root/'juego_offline.html').write_text(rendered,encoding='utf-8')
print('Build v3 offline',len(rendered),'chars')