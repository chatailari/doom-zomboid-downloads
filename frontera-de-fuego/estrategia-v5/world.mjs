/** FRONTERA DE FUEGO 0.5: escenario interactivo con recursos y edificios.
 * Terreno y rendimientos son abstracciones lúdicas, NO cartografía ni meteorología histórica.
 * Sin dependencias, completamente reproducible para guardado y pruebas.
 */
import {BUILDINGS,ensureSettlement,housing} from './settlement.mjs';

export const WIDTH=12, HEIGHT=10, WORLD_SCHEMA=1;
export const LAND=Object.freeze({
 plain:{name:'Pradera',icon:'🟩',colour:'grass'},
 fertile:{name:'Suelo cultivable',icon:'🌿',colour:'fertile'},
 forest:{name:'Bosque',icon:'🌲',colour:'forest'},
 hills:{name:'Cerros',icon:'⛰️',colour:'hills'},
 ore:{name:'Veta mineral',icon:'🪨',colour:'ore'},
 river:{name:'Río',icon:'💧',colour:'river'},
 game:{name:'Zona de caza',icon:'🦌',colour:'game'},
 road:{name:'Camino',icon:'🟫',colour:'road'}
});
const extra={
 caza:{name:'Puesto de caza',icon:'🏹',desc:'Cazadores abastecen alimentos; fauna finita',terrain:['game'],cost:{wood:13,coins:9},max:6,workers:4,category:'produccion'},
 corral:{name:'Corral / criadero',icon:'🐑',desc:'Cría animales y aporta alimento',terrain:['plain','fertile','game'],cost:{wood:20,coins:14},max:5,workers:3,category:'produccion'},
 herreria:{name:'Herrería y forja',icon:'⚒️',desc:'Permite forjar armas con metal y madera',terrain:['plain','fertile','road'],cost:{wood:21,metal:12,coins:14},max:4,workers:4,category:'ejercito'},
 templo:{name:'Templo / lugar ceremonial',icon:'⛪',desc:'Mejora bienestar y cohesión',terrain:['plain','fertile','road'],cost:{wood:22,metal:4,coins:20},max:3,workers:2,category:'poblacion'},
 almacen:{name:'Almacén',icon:'📦',desc:'Resguarda reservas de alimento y materiales',terrain:['plain','fertile','road'],cost:{wood:18,coins:10},max:4,workers:2,category:'produccion'},
 torre:{name:'Torre de vigilancia',icon:'🗼',desc:'Protege de incursiones y refuerza defensas',terrain:['plain','hills','road'],cost:{wood:22,metal:9,coins:11},max:6,workers:2,category:'ejercito'},
 fortin:{name:'Fortín fronterizo',icon:'🏯',desc:'Asegura una zona alejada para expandir el asentamiento',terrain:['plain','hills','fertile'],cost:{wood:28,stone:16,metal:8,coins:17},max:4,workers:3,category:'ejercito'},
 camino:{name:'Camino comercial',icon:'🛤️',desc:'Conecta asentamientos y mejora comercio',terrain:['plain','fertile','forest','game'],cost:{wood:5,coins:3},max:25,workers:0,category:'infraestructura'}
};
const baseCategories={viviendas:'poblacion',chacras:'produccion',aserradero:'produccion',mina:'produccion',mercado:'comercio',cuartel:'ejercito',escuela:'poblacion',muralla:'ejercito'};
const baseTerrain={
 viviendas:['plain','fertile','road'],chacras:['fertile','plain'],aserradero:['forest'],mina:['hills','ore'],
 mercado:['plain','fertile','road'],cuartel:['plain','fertile','road'],escuela:['plain','fertile','road'],muralla:['plain','fertile','hills','road']
};
const baseWorkers={viviendas:0,chacras:4,aserradero:4,mina:5,mercado:3,cuartel:2,escuela:2,muralla:1};
export const STRUCTURES=Object.freeze(Object.fromEntries([
 ...Object.entries(BUILDINGS).map(([key,b])=>[key,{name:b.name,icon:b.icon,desc:b.description,cost:b.cost,max:b.max,terrain:baseTerrain[key],workers:baseWorkers[key],category:baseCategories[key]}]),
 ...Object.entries(extra)
]));
const factionLabels={mapuche:{viviendas:'Rucas',aserradero:'Taller de madera',cuartel:'Reunión de guerreros',escuela:'Enseñanza de oficios',templo:'Espacio ceremonial',muralla:'Palisada',mercado:'Intercambio',herreria:'Taller de metal',torre:'Atalaya',fortin:'Fortificación de frontera'},espanoles:{viviendas:'Viviendas coloniales',templo:'Capilla',muralla:'Empalizada',fortin:'Fuerte de madera',herreria:'Herrería',mercado:'Plaza de comercio'},patriotas:{templo:'Iglesia',cuartel:'Cuartel patriota',muralla:'Fortificación',fortin:'Fortín',herreria:'Armería'},realistas:{templo:'Iglesia',cuartel:'Cuartel realista',muralla:'Fortificación',fortin:'Fortín',herreria:'Armería'}};
export const nameFor=(s,k)=>factionLabels[s.faction]?.[k]||STRUCTURES[k]?.name||k;
export const iconFor=(s,k)=>s.faction==='mapuche'?({templo:'🌿',muralla:'🪵',fortin:'🛖',torre:'🏹',herreria:'⚒️'})[k]||STRUCTURES[k]?.icon:STRUCTURES[k]?.icon;
const error=reason=>({ok:false,reason});
const terrainSeed=(s,x,y)=>((Math.imul((s.seed>>>0)^(s.scenario==='arauco'?0x392a:0x1810),1664525)+x*3029+y*9059)>>>0)%100;
const randAt=(s,x,y)=>{let n=((s.seed>>>0)+x*73856093+y*19349663)>>>0; n^=n<<13;n^=n>>>17;n^=n<<5;return (n>>>0)%100;};
function landAt(s,x,y){
 if(x===0||(x===1&&y>6))return 'river';
 if(x===11||(x===10&&y<4))return randAt(s,x,y)%3===0?'ore':'hills';
 if((y===4||y===5)&&x>=3&&x<=8)return y===4&&x!==4?'road':'plain';
 const a=randAt(s,x,y),m=s.scenario==='arauco'?13:2;
 if(x<5&&a<24+m)return 'forest';
 if(a<11)return 'game';
 if(a<34)return 'forest';
 if(a<56)return 'fertile';
 if(a<68&&x>6)return 'hills';
 if(a<77&&x>6)return 'ore';
 return 'plain';
}
function initialStock(terrain){return {forest:90,game:46,ore:130,hills:85,river:100,fertile:130,plain:0,road:0}[terrain]||0}
function newMap(s){const cells=[];for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
 const terrain=landAt(s,x,y);cells.push({terrain,stock:initialStock(terrain),building:null});
}
 // resources always available for every faction and scenario
 cells[2*WIDTH+3]={terrain:'forest',stock:110,building:null};
 cells[7*WIDTH+3]={terrain:'game',stock:58,building:null};
 cells[2*WIDTH+9]={terrain:'ore',stock:155,building:null};
 cells[6*WIDTH+6]={terrain:'fertile',stock:130,building:null};
 cells[5*WIDTH+5]={terrain:'plain',stock:0,building:null};
 cells[5*WIDTH+6]={terrain:'plain',stock:0,building:null};
 return cells;
}
const addWorld=(s)=>({schema:WORLD_SCHEMA,w:WIDTH,h:HEIGHT,cells:newMap(s),tools:0,weapons:0,stone:12,herd:0,actions:3,events:[],caravans:0,units:{infanteria:0,exploradores:0},seasonNotes:'Selecciona un edificio y después una parcela del mapa.'});
function legacyMapping(s,w){
 const t=ensureSettlement(s);
 // Represent older town building counts with spatial structures without charging them again.
 for(const [k,n] of Object.entries(t.buildings))for(let j=0;j<n;j++){
   const choices=w.cells.map((c,i)=>({c,i})).filter(({c})=>!c.building&&STRUCTURES[k].terrain.includes(c.terrain));
   if(!choices.length)continue;
   choices.sort((a,b)=>{const ax=a.i%WIDTH,ay=Math.floor(a.i/WIDTH),bx=b.i%WIDTH,by=Math.floor(b.i/WIDTH);
      return (Math.abs(ax-5)+Math.abs(ay-5))-(Math.abs(bx-5)+Math.abs(by-5));});
   choices[0].c.building=k;
 }
}
export function ensureWorld(s){ensureSettlement(s);if(!s.world){s.world=addWorld(s);legacyMapping(s,s.world);}return s.world;}
export function validWorld(w){if(!w)return true; if(w.schema!==WORLD_SCHEMA||w.w!==WIDTH||w.h!==HEIGHT||!Array.isArray(w.cells)||w.cells.length!==WIDTH*HEIGHT||!Number.isInteger(w.actions)||w.actions<0||w.actions>3)return false;
 for(const k of ['tools','weapons','stone','herd','caravans'])if(!Number.isInteger(w[k])||w[k]<0||w[k]>1000000)return false;
 if(!w.units||!['infanteria','exploradores'].every(k=>Number.isInteger(w.units[k])&&w.units[k]>=0&&w.units[k]<=5000))return false;
 if(!Array.isArray(w.events)||w.events.length>25||typeof w.seasonNotes!=='string'||w.seasonNotes.length>700)return false;
 for(const c of w.cells)if(!LAND[c.terrain]||!Number.isInteger(c.stock)||c.stock<0||c.stock>2000||(c.building!==null&&!STRUCTURES[c.building]))return false;
 return true;
}
export function buildingCount(s,key){const w=ensureWorld(s);return w.cells.filter(c=>c.building===key).length;}
export const tile=(s,i)=>ensureWorld(s).cells[i];
export const tilePosition=i=>({x:i%WIDTH,y:Math.floor(i/WIDTH)});
function costEnough(s,c){const t=ensureSettlement(s),w=ensureWorld(s);return Object.entries(c).every(([key,v])=>(key==='coins'?t.coins:key==='stone'?w.stone:s[key])>=v)}
function spend(s,c){const t=ensureSettlement(s),w=ensureWorld(s);for(const [key,v] of Object.entries(c)){if(key==='coins')t.coins-=v;else if(key==='stone')w.stone-=v;else s[key]-=v;}}
function log(w,msg){w.seasonNotes=msg;w.events.unshift(msg);w.events=w.events.slice(0,20);}
export function buildOn(s,key,index){
 const w=ensureWorld(s),t=ensureSettlement(s),def=STRUCTURES[key];
 if(s.status!=='playing')return error('Primero continúa o comienza un capítulo histórico.');
 if(!def)return error('Estructura no disponible.');
 if(!Number.isInteger(index)||index<0||index>=w.cells.length)return error('Parcela inválida.');
 const c=w.cells[index];if(c.building)return error('Esta parcela ya tiene una construcción.');
 if(!def.terrain.includes(c.terrain))return error(`El terreno ${LAND[c.terrain].name} no sirve para ${nameFor(s,key)}.`);
 if(buildingCount(s,key)>=def.max)return error('Ya alcanzaste el máximo de esta estructura.');
 if(!costEnough(s,def.cost))return error('Faltan materiales o monedas para construir.');
 const {x,y}=tilePosition(index),near=w.cells.some((v,i)=>v.building&&Math.abs(i%WIDTH-x)+Math.abs(Math.floor(i/WIDTH)-y)<=5);
 if(!near&&key!=='fortin')return error('Construye cerca de tu poblado o establece un fortín fronterizo.');
 spend(s,def.cost);c.building=key;
 if(key in BUILDINGS){t.buildings[key]++;if(key==='cuartel')s.morale=Math.min(100,s.morale+3);}
 if(key==='templo')t.happiness=Math.min(100,t.happiness+6);
 if(key==='corral')w.herd+=3;
 log(w,`Construiste ${nameFor(s,key)} en la parcela ${x+1},${y+1}.`);
 return {ok:true,description:w.seasonNotes};
}
export function clearBuilding(s,index){const w=ensureWorld(s);if(s.status!=='playing')return error('Termina el episodio antes de administrar.');const c=w.cells[index];if(!c||!c.building)return error('No hay edificio que retirar.');
 const k=c.building;if(k==='viviendas'&&buildingCount(s,k)<=1)return error('Conserva al menos una vivienda.');if(k==='chacras'&&buildingCount(s,k)<=1)return error('Conserva al menos una chacra.');
 const t=ensureSettlement(s);if(k in BUILDINGS)t.buildings[k]--;c.building=null;log(w,'Retiraste una construcción sin recuperar los materiales gastados.');return {ok:true,description:w.seasonNotes};}
export function gather(s,index,kind){const w=ensureWorld(s);if(s.status!=='playing')return error('Solo durante la preparación.');if(w.actions===0)return error('Ya usaste tus tres órdenes de trabajadores esta estación.');
 const c=w.cells[index];if(!c)return error('Parcela inválida.');let resource,qty;
 if(kind==='wood'&&c.terrain==='forest'){resource='wood';qty=Math.min(c.stock,12);}else if(kind==='food'&&c.terrain==='game'){resource='food';qty=Math.min(c.stock,9);}else if(kind==='stone'&&['hills','ore'].includes(c.terrain)){resource='stone';qty=Math.min(c.stock,9);}else return error('En esa parcela no se puede realizar esta tarea.');
 if(!qty)return error('La parcela agotó sus recursos; deja tiempo para que se regenere.');
 c.stock-=qty;w.actions--;if(resource==='stone')w.stone+=qty;else s[resource]+=qty;
 log(w,{wood:`Leñadores cortaron ${qty} madera.`,food:`Cazadores consiguieron ${qty} alimentos.`,stone:`Canteros reunieron ${qty} piedra.`}[resource]);
 return {ok:true,description:w.seasonNotes};
}
export function forge(s){const w=ensureWorld(s),t=ensureSettlement(s);if(s.status!=='playing')return error('El taller permanece cerrado entre episodios.');if(!buildingCount(s,'herreria'))return error('Primero construye una herrería.');
 const cost={wood:5,metal:9,coins:6};if(!costEnough(s,cost))return error('Necesitas 5 madera, 9 metal y 6 monedas.');
 spend(s,cost);w.weapons+=7;log(w,'Herreros fabricaron 7 equipos de armas. Mejorarán el siguiente combate.');return {ok:true,description:w.seasonNotes};}
const prices={food:3,wood:4,metal:7,stone:4};
export function trade(s,kind,resource,qty=10){const w=ensureWorld(s),t=ensureSettlement(s);if(s.status!=='playing')return error('Comercio no disponible entre episodios.');if(!buildingCount(s,'mercado'))return error('Primero construye un mercado.');if(!prices[resource]||!['buy','sell'].includes(kind)||qty!==10)return error('Operación comercial no válida.');
 const price=qty*prices[resource]+(kind==='buy'?8:0);
 const stock=resource==='stone'?w.stone:s[resource];if(kind==='buy'&&t.coins<price)return error('Monedas insuficientes.');if(kind==='sell'&&stock<qty)return error('No hay suficiente mercancía.');
 if(kind==='buy'){t.coins-=price;if(resource==='stone')w.stone+=qty;else s[resource]+=qty;}
 else {t.coins+=price;if(resource==='stone')w.stone-=qty;else s[resource]-=qty;}
 w.caravans++;log(w,`${kind==='buy'?'Compraste':'Vendiste'} ${qty} de ${resource} por ${price} monedas. Caravana ${w.caravans}.`);return {ok:true,description:w.seasonNotes};}
const jobData={chacras:{workers:4},aserradero:{workers:4},mina:{workers:5},mercado:{workers:3},caza:{workers:4},corral:{workers:3},herreria:{workers:4},templo:{workers:2}};
export function production(s){const w=ensureWorld(s),t=ensureSettlement(s);
 const jobs=w.cells.map((c,i)=>({key:c.building,index:i,stock:c.stock,terrain:c.terrain})).filter(v=>v.key&&jobData[v.key]);
 const workers=Math.max(0,Math.floor(t.population*.60)-Math.ceil(s.army*.10));
 const demand=jobs.reduce((n,j)=>n+jobData[j.key].workers,0);
 const factor=Math.max(0,Math.min(1,workers/Math.max(1,demand)));
 const potential={food:0,wood:0,metal:0,coins:2,stone:0};
 for(const j of jobs){const mul=factor;
  switch(j.key){case 'chacras':potential.food+=(13+t.advances.cultivos*5)*mul;break;
   case 'aserradero':potential.wood+=(j.stock>0?Math.min(9,j.stock):0)*mul;break;
   case 'mina':potential.metal+=(j.stock>0?Math.min(7,j.stock):0)*mul;potential.stone+=(j.stock>0?Math.min(3,j.stock):0)*mul;break;
   case 'caza':potential.food+=(j.stock>0?Math.min(9,j.stock):0)*mul;break;
   case 'corral':potential.food+=7*mul;break;
   case 'mercado':potential.coins+=(9+t.advances.logistica*3)*mul;break;
   default:break;
  }
 }
 const upkeep=Math.ceil(t.population/9)+Math.ceil(s.army/8)+buildingCount(s,'corral')*2;
 return {workers,demand,factor,upkeep,potential:Object.fromEntries(Object.entries(potential).map(([k,v])=>[k,Math.round(v)])),free:Math.max(0,workers-demand)};
}
export function nextSeason(s,rainy=false){const w=ensureWorld(s),t=ensureSettlement(s);if(s.status!=='playing')return error('Continúa la campaña histórica antes de avanzar.');if(t.season>=8)return error('Terminó el período de preparación: ahora debes resolver el episodio.');
 const p=production(s),before=s.food;let food=0,wood=0,metal=0,stone=0,coins=2;
 const step=t.season+1;
 for(const c of w.cells){if(!c.building)continue;
 const staff=p.factor,adv=t.advances;
 if(c.building==='chacras')food+=Math.max(0,Math.round((13+adv.cultivos*5)*staff*(rainy?0.8:1)));
 if(c.building==='aserradero'){const n=Math.min(c.stock,Math.round(9*staff));c.stock-=n;wood+=n;}
 if(c.building==='mina'){const m=Math.min(c.stock,Math.round(9*staff)),ore=Math.round(m*.7);c.stock-=m;metal+=ore;stone+=m-ore;}
 if(c.building==='caza'){const n=Math.min(c.stock,Math.round(9*staff));c.stock-=n;food+=n;}
 if(c.building==='corral')food+=Math.round(7*staff);
 if(c.building==='mercado')coins+=Math.round((9+adv.logistica*3)*staff);
 }
 const upkeep=p.upkeep;
 s.food=Math.min(200000,Math.max(0,s.food+food-upkeep));s.wood=Math.min(200000,s.wood+wood);s.metal=Math.min(200000,s.metal+metal);w.stone=Math.min(200000,w.stone+stone);t.coins=Math.min(1000000,t.coins+coins);
 const shortage=before+food<upkeep;
 if(shortage){t.population=Math.max(5,t.population-Math.max(1,Math.ceil(t.population*.09)));t.happiness=Math.max(0,t.happiness-12);s.morale=Math.max(20,s.morale-6);}
 else {const growth=t.happiness>55?Math.max(1,Math.floor(t.population*.06)):0;t.population=Math.min(housing(t),t.population+growth);
   t.happiness=Math.max(0,Math.min(98,t.happiness+(buildingCount(s,'templo')?3:0)+(t.population<housing(t)?1:-1)));}
 if(buildingCount(s,'cuartel'))s.morale=Math.min(100,s.morale+1);
 // Controlled wildlife regeneration; saplings recover slowly and minerals never regenerate.
 for(const c of w.cells){if(c.terrain==='forest'&&c.stock<120)c.stock+=2;if(c.terrain==='game'&&c.stock<60)c.stock+=3;}
 w.herd=Math.min(150,w.herd+Math.max(0,buildingCount(s,'corral')));
 t.season=step;w.actions=3;
 const raid=(step%3===0&&((s.seed+step*33)%7)<3);
 let attack='';if(raid){const defense=buildingCount(s,'muralla')*3+buildingCount(s,'torre')*4+Math.floor(s.army/8);
 if(defense<7){const stolen=Math.min(s.food,8);s.food-=stolen;t.happiness=Math.max(0,t.happiness-4);attack=` Incursión: se perdieron ${stolen} alimentos. Construye defensas.`;}else attack=' Los vigías detuvieron una incursión.';}
 log(w,`Estación ${step}/8: +${food} alimentos, +${wood} madera, +${metal} metal, +${stone} piedra, +${coins} monedas. Consumo ${upkeep}.${shortage?' Escasez: disminuyó la población.':''}${attack}`);
 t.lastEvent=w.seasonNotes;
 return {ok:true,description:w.seasonNotes,shortage};}
export function defenseLevel(s){return buildingCount(s,'muralla')*3+buildingCount(s,'torre')*4+buildingCount(s,'cuartel')*2+buildingCount(s,'fortin')*5;}
export function combatWorldBonus(s){if(!s.world)return 0;const w=ensureWorld(s);return Math.min(.24,(w.weapons/Math.max(1,s.army))*.20+defenseLevel(s)*.004+w.units.exploradores*.004);}
export function onBattle(s,losses){if(!s.world)return;const w=ensureWorld(s);w.weapons=Math.max(0,w.weapons-Math.floor(losses*.7));for(const k of ['infanteria','exploradores'])w.units[k]=Math.max(0,w.units[k]-Math.ceil(losses*.3));}
export function trainTroops(s,type){const w=ensureWorld(s),t=ensureSettlement(s);if(s.status!=='playing')return error('Termina el capítulo para reorganizar las tropas.');if(!buildingCount(s,'cuartel'))return error('Primero construye un cuartel o reunión de guerreros.');if(!['infanteria','exploradores'].includes(type))return error('Unidad desconocida.');if(t.population<13)return error('Necesitas una población mínima de 13 habitantes.');const cost=type==='exploradores'?{food:14,wood:8,coins:8}:{food:13,metal:8,coins:8};if(!costEnough(s,cost))return error('Faltan alimentos, equipo o monedas para entrenar.');spend(s,cost);t.population-=5;t.happiness=Math.max(0,t.happiness-1);s.army+=5;w.units[type]+=5;log(w,`Se entrenaron 5 ${type==='exploradores'?'exploradores':'combatientes'}; 5 habitantes ingresaron al ejército.`);return {ok:true,description:w.seasonNotes};}
export function worldSummary(s){const w=ensureWorld(s);return {population:s.town.population,capacity:housing(s.town),happiness:s.town.happiness,coins:s.town.coins,stone:w.stone,weapons:w.weapons,actions:w.actions,herd:w.herd,defense:defenseLevel(s),units:w.units,jobs:production(s),built:w.cells.filter(c=>c.building).length};}