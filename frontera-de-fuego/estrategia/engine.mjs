/** FRONTERA DE FUEGO: motor estrategico determinista, sin dependencias. */
import {climateForCampaign} from './historical_data.mjs';
export const GAME_SCHEMA = 1;
export const FACTIONS = Object.freeze({
  espanoles: {name:'Expedición española',color:'#d8a45a'},
  mapuche: {name:'Coalición mapuche',color:'#70bd9e'},
  independiente: {name:'Comunidades independientes',color:'#b2b4b3'}
});
export const REGIONS = Object.freeze([
  {id:'aconcagua',name:'Valle de Aconcagua',x:43,y:13,terrain:'valle',links:['mapocho','maule'],output:{food:5,wood:2,metal:2}},
  {id:'mapocho',name:'Valle del Mapocho',x:48,y:30,terrain:'valle',links:['aconcagua','maule'],output:{food:6,wood:2,metal:1}},
  {id:'maule',name:'Territorio del Maule',x:43,y:48,terrain:'rio',links:['aconcagua','mapocho','biobio'],output:{food:5,wood:5,metal:0}},
  {id:'biobio',name:'Territorio del Biobío',x:38,y:64,terrain:'rio',links:['maule','tucapel','arauco'],output:{food:6,wood:5,metal:1}},
  {id:'tucapel',name:'Tucapel',x:49,y:76,terrain:'bosque',links:['biobio','arauco','valdivia'],output:{food:4,wood:6,metal:1}},
  {id:'arauco',name:'Territorio de Arauco',x:28,y:80,terrain:'bosque',links:['biobio','tucapel'],output:{food:4,wood:7,metal:1}},
  {id:'valdivia',name:'Territorio de Valdivia',x:60,y:90,terrain:'bosque',links:['tucapel'],output:{food:5,wood:7,metal:1}}
]);
const regionIndex = Object.fromEntries(REGIONS.map(r=>[r.id,r]));
function log(state,tag,title,details){state.chronicle.unshift({year:state.year,tag,title,details});state.chronicle=state.chronicle.slice(0,100)}
function droll(state){state.seed = (Math.imul(state.seed,1664525)+1013904223)>>>0;return state.seed/4294967296}
function fail(reason){return {ok:false,reason}}
function done(state,desc){log(state,'accion',desc,'');return {ok:true,description:desc}}
export function newCampaign(faction='mapuche',seed=1541){
  if(!['mapuche','espanoles'].includes(faction))throw Error('Bando no disponible');
  const owned={aconcagua:'independiente',mapocho:'espanoles',maule:'independiente',biobio:'independiente',tucapel:'mapuche',arauco:'mapuche',valdivia:'independiente'};
  const troops={aconcagua:7,mapocho:13,maule:9,biobio:10,tucapel:13,arauco:14,valdivia:8};
  const state={schema:GAME_SCHEMA,year:1541,turn:0,faction,seed:seed>>>0,worldSeed:seed>>>0,resources:{food:55,wood:30,metal:24},
    regions:Object.fromEntries(REGIONS.map(r=>[r.id,{owner:owned[r.id],troops:troops[r.id],fort:r.id==='mapocho'?1:0}])),
    history:{tucapel:null,branch:'abierta'},chronicle:[]};
  log(state,'inicio','Comienza la campaña de 1541','Los pueblos y territorios se representan de forma simplificada para el prototipo.');
  return state;
}
export function validateState(s){
  if(!s||s.schema!==GAME_SCHEMA||!['mapuche','espanoles'].includes(s.faction)||!Number.isInteger(s.year)||s.year<1541||s.year>1800) return false;
  if(!Number.isInteger(s.turn)||!Number.isInteger(s.seed)||!s.resources||!s.regions||!Array.isArray(s.chronicle)||!s.history)return false;
  if(!['food','wood','metal'].every(k=>Number.isFinite(s.resources[k])&&s.resources[k]>=0))return false;
  return REGIONS.every(r=>{let x=s.regions[r.id];return x&&Object.hasOwn(FACTIONS,x.owner)&&Number.isInteger(x.troops)&&x.troops>=0&&Number.isInteger(x.fort)&&x.fort>=0&&x.fort<=3});
}
export function neighbors(id){return regionIndex[id]?.links??[]}
export function region(id){return regionIndex[id]??null}
export function owns(state,id){return state.regions[id]?.owner===state.faction}
export function eligibleAttack(state,from,to){return Boolean(region(from)&&region(to)&&neighbors(from).includes(to)&&owns(state,from)&&state.regions[to].owner!==state.faction&&state.regions[from].troops>=3)}
export function recruit(state,id){
  if(!owns(state,id))return fail('Recluta en un territorio propio.');
  if(state.resources.food<8||state.resources.metal<3)return fail('Faltan 8 alimentos o 3 metales.');
  state.resources.food-=8;state.resources.metal-=3;state.regions[id].troops+=5;
  return done(state,'Se incorporaron 5 combatientes en '+region(id).name+'.');
}
export function fortify(state,id){
  if(!owns(state,id))return fail('Solo puedes reforzar territorios propios.');
  if(state.regions[id].fort>=3)return fail('Fortificación al máximo.');
  if(state.resources.wood<12||state.resources.metal<3)return fail('Faltan 12 maderas o 3 metales.');
  state.resources.wood-=12;state.resources.metal-=3;state.regions[id].fort+=1;
  return done(state,'Defensas reforzadas en '+region(id).name+'.');
}
export function negotiate(state,id){
  if(!region(id)||state.regions[id].owner!=='independiente')return fail('La negociación está reservada a comunidades independientes.');
  if(!REGIONS.some(r=>owns(state,r.id)&&neighbors(r.id).includes(id)))return fail('Necesitas presencia en una zona vecina.');
  if(state.resources.food<12||state.resources.wood<5)return fail('Oferta insuficiente: 12 alimentos y 5 maderas.');
  state.resources.food-=12;state.resources.wood-=5;
  const acceptance=0.38+(state.regions[id].troops<10?0.1:0);
  if(droll(state)<acceptance){state.regions[id].owner=state.faction;log(state,'diplomacia','Alianza en '+region(id).name,'Un acuerdo político incorporó el territorio sin combate.');return {ok:true,description:'Alianza aceptada.'}}
  log(state,'diplomacia','Oferta rechazada en '+region(id).name,'La negociación fracasó.');return {ok:true,description:'Oferta rechazada; recursos consumidos.'};
}
export function battle(state,from,to,manualBonus=0){
  if(!eligibleAttack(state,from,to))return fail('Ataque no permitido. Revisa adyacencia, propiedad y tropas.');
  if(!Number.isFinite(manualBonus))return fail('Resultado táctico inválido.');
  const source=state.regions[from],target=state.regions[to],attacker=source.troops-1;
  const terrainModifier={valle:1,rio:1.13,bosque:1.22}[region(to).terrain];
  const simulatedWeather=climateForCampaign(state,to);
  // Balance de prueba, NO inferencia de la meteorología de una batalla documentada.
  const weatherFactor=simulatedWeather?.rainy?(state.faction==='espanoles'?0.82:0.94):1;
  const attackStrength=attacker*(0.82+0.37*droll(state))*(1+Math.max(-0.25,Math.min(0.55,manualBonus)))*weatherFactor;
  const defendStrength=(target.troops+4*target.fort)*terrainModifier*(0.86+0.30*droll(state));
  const victory=attackStrength>defendStrength;
  const beforeOwner=target.owner;
  const taken=Math.max(1,Math.round(attacker*(victory?0.25:0.52)));
  const defendersLost=Math.max(1,Math.round(target.troops*(victory?0.78:0.34)));
  source.troops=1;
  if(victory){target.owner=state.faction;target.troops=Math.max(1,attacker-taken);target.fort=Math.max(0,target.fort-1)}
  else{source.troops+=Math.max(0,attacker-taken);target.troops=Math.max(1,target.troops-defendersLost)}
  const headline=victory?'Victoria en '+region(to).name:'Derrota en '+region(to).name;
  log(state,'batalla',headline,`Atacante: ${state.faction}; defensor: ${beforeOwner}. Bajas atacantes: ${taken}, defensoras: ${defendersLost}. Tiempo: ${simulatedWeather?.name}; modelado, no observado.`);
  if(to==='tucapel'&&state.year>=1548&&state.year<=1560){
    state.history.tucapel=victory?state.faction:beforeOwner;
    state.history.branch=state.history.tucapel==='espanoles'?'alternativa':'histórica posible';
    log(state,'historia',state.history.branch==='alternativa'?'Tucapel: una victoria cambia la historia':'Tucapel: resistencia victoriosa','Resultado de la partida, no afirmación de lo que ocurrió históricamente.');
  }
  return {ok:true,victory,attackerLosses:taken,defenderLosses:defendersLost,description:headline};
}
export function endTurn(state){
  if(state.year>=1800)return fail('La campaña alcanzó el límite temporal del prototipo.');
  state.turn+=1;state.year+=1;
  let income={food:0,wood:0,metal:0},upkeep=0;
  for(const r of REGIONS){let x=state.regions[r.id];if(x.owner===state.faction){for(const k of Object.keys(income))income[k]+=r.output[k];upkeep+=Math.ceil(x.troops/6)}}
  state.resources.food=Math.max(0,state.resources.food+income.food-upkeep);
  state.resources.wood+=income.wood;state.resources.metal+=income.metal;
  if(state.resources.food===0){for(const x of Object.values(state.regions)){if(x.owner===state.faction)x.troops=Math.max(1,x.troops-2)}log(state,'crisis','Escasez de alimentos','Las tropas sufren deserciones y enfermedades.');}
  // La IA añade presión limitada y comprobable; no mueve al jugador ni inventa territorios.
  const rivals=REGIONS.filter(r=>state.regions[r.id].owner!==state.faction);
  if(rivals.length){let rival=rivals[Math.floor(droll(state)*rivals.length)];state.regions[rival.id].troops=Math.min(38,state.regions[rival.id].troops+2)}
  if(state.year===1553){
    const actual=state.history.tucapel;
    if(actual==='espanoles') {state.history.branch='alternativa';log(state,'historia','1553: historia divergente','La campaña considera una victoria española en Tucapel; el destino de los líderes y asentamientos deja de seguir el resultado documentado.');}
    else if(actual==='mapuche'){state.history.branch='histórica posible';log(state,'historia','1553: resistencia en Tucapel','La situación coincide parcialmente con el desenlace histórico; otras decisiones pueden seguir desviando la campaña.');}
    else {log(state,'historia','1553: crisis de Tucapel','Históricamente las fuerzas mapuches derrotaron allí a Valdivia. En esta campaña el resultado todavía no está decidido.');}
  }
  log(state,'turno','Año '+state.year,`Producción: +${income.food} alimento, +${income.wood} madera, +${income.metal} metal; consumo militar ${upkeep}.`);
  return {ok:true,description:'Comienza el año '+state.year};
}
export function exportSave(state){if(!validateState(state))throw Error('Partida inválida');return JSON.stringify(state)}
export function importSave(text){let parsed=JSON.parse(text);if(!validateState(parsed))throw Error('Archivo de partida incompatible o corrupto');return parsed}