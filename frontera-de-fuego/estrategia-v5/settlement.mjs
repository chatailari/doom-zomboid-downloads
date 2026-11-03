/** Economía lúdica de asentamientos. Todas las cifras son equilibrio de juego, no reconstrucciones históricas. */
export const SETTLEMENT_VERSION=1;
export const BUILDINGS=Object.freeze({
 viviendas:{name:'Viviendas',icon:'🏠',description:'+22 plazas para familias',cost:{wood:16,coins:7},max:10},
 chacras:{name:'Cultivos',icon:'🌾',description:'+13 alimentos por estación',cost:{wood:14,coins:8},max:9},
 aserradero:{name:'Aserradero',icon:'🪵',description:'+9 madera por estación',cost:{wood:11,coins:10},max:7},
 mina:{name:'Mina',icon:'⛏️',description:'+7 metal por estación',cost:{wood:17,coins:13},max:7},
 mercado:{name:'Mercado',icon:'🏺',description:'+10 monedas por estación',cost:{wood:17,metal:6,coins:18},max:6},
 cuartel:{name:'Cuartel',icon:'🛡️',description:'Refuerza el ejército y la defensa',cost:{wood:23,metal:16,coins:16},max:5},
 escuela:{name:'Escuela de oficios',icon:'📚',description:'Desbloquea avances técnicos',cost:{wood:20,metal:10,coins:20},max:1},
 muralla:{name:'Defensas',icon:'🏰',description:'Mayor resistencia en las batallas',cost:{wood:20,metal:20,coins:15},max:5}
});
export const ADVANCES=Object.freeze({
 cultivos:{name:'Mejora agrícola',description:'Las chacras producen +5 alimentos por nivel',cost:{coins:28,wood:12},max:2},
 metalurgia:{name:'Metalurgia',description:'Mejores herramientas y equipo militar',cost:{coins:34,metal:17},max:2},
 logistica:{name:'Organización',description:'Mejores suministros y comercio',cost:{coins:30,wood:12},max:2}
});
const fresh=()=>({schema:SETTLEMENT_VERSION,population:38,happiness:72,coins:36,season:0,buildings:{viviendas:1,chacras:1,aserradero:0,mina:0,mercado:0,cuartel:0,escuela:0,muralla:0},advances:{cultivos:0,metalurgia:0,logistica:0},lastEvent:'Tu asentamiento espera sus primeras decisiones.'});
export function ensureSettlement(s){if(!s.town)s.town=fresh();return s.town;}
export function validateSettlement(t){if(!t || t.schema!==SETTLEMENT_VERSION || !Number.isInteger(t.population) || t.population<5 || t.population>50000 || !Number.isInteger(t.happiness)||t.happiness<0||t.happiness>100||!Number.isInteger(t.coins)||t.coins<0||t.coins>1000000||!Number.isInteger(t.season)||t.season<0||t.season>8)return false;
 if(!t.buildings||!t.advances||typeof t.lastEvent!=='string'||t.lastEvent.length>500)return false;
 for(const [k,v] of Object.entries(BUILDINGS))if(!Number.isInteger(t.buildings[k])||t.buildings[k]<0||t.buildings[k]>v.max)return false;
 for(const [k,v] of Object.entries(ADVANCES))if(!Number.isInteger(t.advances[k])||t.advances[k]<0||t.advances[k]>v.max)return false;
 return true;}
export const housing=t=>28+t.buildings.viviendas*22;
export function incomes(s){const t=ensureSettlement(s),b=t.buildings,a=t.advances,workers=Math.max(8,t.population),demand=12+8*(b.chacras+b.aserradero+b.mina+b.mercado),labor=Math.min(1,workers/demand);
 const food=Math.round((5+b.chacras*(13+a.cultivos*5))*labor),wood=Math.round((2+b.aserradero*9)*labor),metal=Math.round((1+b.mina*7)*labor),coins=Math.round((4+b.mercado*(10+a.logistica*3))*labor),upkeep=Math.ceil(t.population/9)+Math.ceil(s.army/7);
 return {food,wood,metal,coins,upkeep,netFood:food-upkeep,labor,capacity:housing(t)};}
const townFail=reason=>({ok:false,reason});
const affordable=(s,c)=>Object.entries(c).every(([k,n])=>(k==='coins'?ensureSettlement(s).coins:s[k])>=n);
const charge=(s,c)=>{const t=ensureSettlement(s);for(const [k,n] of Object.entries(c))if(k==='coins')t.coins-=n;else s[k]-=n;};
export function construct(s,key){const t=ensureSettlement(s),item=BUILDINGS[key];if(!item)return townFail('Edificio no disponible');if(s.status!=='playing')return townFail('Construye antes de resolver el episodio.');if(t.buildings[key]>=item.max)return townFail('Ya alcanzaste el límite de esta estructura.');if(!affordable(s,item.cost))return townFail('Faltan recursos para construir '+item.name+'.');
 charge(s,item.cost);t.buildings[key]++;if(key==='cuartel')s.morale=Math.min(100,s.morale+3);if(key==='mercado')t.happiness=Math.min(100,t.happiness+3);
 t.lastEvent='Se construyó '+item.name+'.';return {ok:true,description:t.lastEvent};}
export function unlockAdvance(s,key){const t=ensureSettlement(s),item=ADVANCES[key];if(!item)return townFail('Avance desconocido');if(s.status!=='playing')return townFail('Investiga antes de resolver el episodio.');if(t.buildings.escuela===0)return townFail('Primero construye una escuela de oficios.');if(t.advances[key]>=item.max)return townFail('Este avance ya alcanzó el nivel máximo.');if(!affordable(s,item.cost))return townFail('Faltan recursos para investigar '+item.name+'.');charge(s,item.cost);t.advances[key]++;t.lastEvent=item.name+' nivel '+t.advances[key]+' investigado.';return {ok:true,description:t.lastEvent};}
export function advanceSeason(s, rainy=false){const t=ensureSettlement(s);if(s.status!=='playing')return townFail('La misión ya está resuelta.');if(t.season>=8)return townFail('Llegó la campaña militar. No puedes seguir produciendo indefinidamente.');const p=incomes(s),crop=Math.round(p.food*(rainy?.80:1)),oldFood=s.food;
 s.food=Math.max(0,s.food+crop-p.upkeep);s.wood=Math.min(100000,s.wood+p.wood);s.metal=Math.min(100000,s.metal+p.metal);t.coins=Math.min(1000000,t.coins+p.coins);
 const hungry=oldFood+crop<p.upkeep;
 if(hungry){t.population=Math.max(5,t.population-Math.max(1,Math.ceil(t.population*.08)));t.happiness=Math.max(0,t.happiness-13);s.morale=Math.max(20,s.morale-7);}
 else {const growth=t.happiness>=55?Math.max(1,Math.floor(t.population*.055)):0;t.population=Math.min(housing(t),t.population+growth);t.happiness=Math.min(95,t.happiness+(t.population<housing(t)?2:-1));}
 if(t.buildings.cuartel) s.morale=Math.min(100,s.morale+1);
 t.season++;t.lastEvent=`Estación ${t.season}/8: +${crop} alimentos, +${p.wood} madera, +${p.metal} metal, +${p.coins} monedas; consumo ${p.upkeep}.${hungry?' Escasez: emigró población.':''}`;
 return {ok:true,description:t.lastEvent,shortage:hungry};}
export function newChapterSettlement(s){const t=ensureSettlement(s);t.season=0;t.coins=Math.min(1000000,t.coins+12);t.lastEvent='Nueva etapa histórica. Se conservan los edificios, avances y habitantes.';}
export function combatModifier(s){if(!s.town)return 0;const t=ensureSettlement(s);return Math.min(.33,t.advances.metalurgia*.055+t.advances.logistica*.035+t.buildings.muralla*.016+t.buildings.cuartel*.018+(t.happiness>=80?.025:0));}
export function settlementStatus(s){const t=ensureSettlement(s);const b=t.buildings;return {population:t.population,happiness:t.happiness,housing:housing(t),coins:t.coins,season:t.season,buildings:Object.values(b).reduce((a,x)=>a+x,0),production:incomes(s)};}