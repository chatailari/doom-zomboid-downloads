/** Motor determinista de campaña para FRONTERA DE FUEGO. No hay compras ni backend. */
import {FACTIONS,REGIONS,REGION_INDEX,SCENARIOS,EVENTS,TERRAIN,climateAt} from './scenarios.mjs';
export {FACTIONS,REGIONS,SCENARIOS,EVENTS,TERRAIN,climateAt};
export const GAME_SCHEMA=2;
const TOTAL=REGIONS.length;
const own=(s,id)=>s.regions?.[id]?.owner===s.faction;
const sumOwned=(s,f)=>REGIONS.filter(r=>s.regions[r.id].owner===f).length;
const opposite=(s)=>SCENARIOS[s.scenario].factions.find(f=>f!==s.faction);
const rand=(s)=>{s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;};
const log=(s,type,title,details='')=>{s.chronicle.unshift({year:s.year,type,title,details});s.chronicle=s.chronicle.slice(0,150)};
const bad=reason=>({ok:false,reason});
const success=(s,description)=>{log(s,'accion',description);return {ok:true,description}};
const cost=(s,{food=0,wood=0,metal=0}={})=>s.resources.food>=food&&s.resources.wood>=wood&&s.resources.metal>=metal;
const charge=(s,{food=0,wood=0,metal=0}={})=>{s.resources.food-=food;s.resources.wood-=wood;s.resources.metal-=metal};
const mayAct=s=>s.status==='playing'&&s.actions>0;
export const neighbors=id=>REGION_INDEX[id]?.links??[];
export const region=id=>REGION_INDEX[id]??null;
export const owns=(s,id)=>own(s,id);
export const opponent=s=>opposite(s);
export const ownedCount=(s,f=s.faction)=>sumOwned(s,f);
export function newCampaign(faction='mapuche',seed=1541,scenario='arauco'){
 const conf=SCENARIOS[scenario]; if(!conf||!conf.factions.includes(faction))throw Error('Bando/escenario no disponible');
 const regions=Object.fromEntries(REGIONS.map(r=>[r.id,{owner:conf.owner[r.id]??'independiente',troops:conf.troops[r.id]??(r.terrain==='bosque'?10:8),fort:r.id===conf.capital[faction]?1:0,farm:0,road:0,morale:70}]));
 const s={schema:GAME_SCHEMA,scenario,faction,year:conf.start,turn:0,seed:seed>>>0,worldSeed:seed>>>0,status:'playing',result:null,
  actions:4,resources:{food:70,wood:45,metal:30},technology:{agriculture:0,logistics:0,tactics:0,scouting:0},
  regions,history:{branch:'historia abierta',events:{},tucapel:null},chronicle:[],stats:{battles:0,victories:0,losses:0,alliances:0},legitimacy:60};
 log(s,'inicio',conf.name,'Simulación histórica: territorios, cantidades y alianzas iniciales son simplificaciones lúdicas, no censos ni mapas exactos.');
 return s;
}
export function validateState(s){
 if(!s||s.schema!==GAME_SCHEMA||!SCENARIOS[s.scenario]?.factions.includes(s.faction))return false;
 if(!Number.isInteger(s.year)||s.year<1541||s.year>1900||!Number.isInteger(s.turn)||s.turn<0||!Number.isInteger(s.seed)||!Number.isInteger(s.worldSeed))return false;
 if(!Number.isInteger(s.actions)||s.actions<0||s.actions>4||!['playing','won','lost','finished'].includes(s.status))return false;
 if(!s.resources||!['food','wood','metal'].every(k=>Number.isSafeInteger(s.resources[k])&&s.resources[k]>=0&&s.resources[k]<1000000))return false;
 if(!s.technology||!['agriculture','logistics','tactics','scouting'].every(k=>Number.isInteger(s.technology[k])&&s.technology[k]>=0&&s.technology[k]<=3))return false;
 if(!Number.isInteger(s.legitimacy)||s.legitimacy<0||s.legitimacy>100||!s.history||!s.history.events||!Array.isArray(s.chronicle)||s.chronicle.length>150)return false;
 if(!s.stats||!['battles','victories','losses','alliances'].every(k=>Number.isInteger(s.stats[k])&&s.stats[k]>=0))return false;
 return REGIONS.every(r=>{const p=s.regions?.[r.id];return p&&Object.hasOwn(FACTIONS,p.owner)&&Number.isInteger(p.troops)&&p.troops>=0&&p.troops<10000&&['fort','farm','road'].every(k=>Number.isInteger(p[k])&&p[k]>=0&&p[k]<=3)&&Number.isInteger(p.morale)&&p.morale>=0&&p.morale<=100});
}
function requireAction(s){if(s.status!=='playing')return bad('La campaña ya terminó.');if(s.actions<=0)return bad('Se agotaron las órdenes de este año.');return null;}
export function recruit(s,id){const err=requireAction(s);if(err)return err;if(!own(s,id))return bad('Recluta solo en un territorio propio.');const c={food:9,metal:3};if(!cost(s,c))return bad('Reclutar cuesta 9 alimentos y 3 metales.');charge(s,c);s.regions[id].troops+=5+s.technology.logistics;s.actions--;return success(s,'Reclutados combatientes en '+region(id).name+'.')}
export function fortify(s,id){return develop(s,id,'fort')}
export function develop(s,id,kind){const err=requireAction(s);if(err)return err;if(!own(s,id))return bad('Construye solo en tu territorio.');if(!['fort','farm','road'].includes(kind))return bad('Construcción desconocida.');const p=s.regions[id];if(p[kind]>=3)return bad('Nivel máximo alcanzado.');const costBy={fort:{wood:13,metal:5},farm:{wood:10,food:6},road:{wood:8,metal:3}};if(!cost(s,costBy[kind]))return bad('Recursos insuficientes para construir.');charge(s,costBy[kind]);p[kind]++;s.actions--;return success(s,({fort:'Fortificación',farm:'Cultivos',road:'Ruta de suministros'})[kind]+' nivel '+p[kind]+' en '+region(id).name+'.')}
export function moveTroops(s,from,to,amount){const err=requireAction(s);if(err)return err;if(!own(s,from)||!own(s,to)||!neighbors(from).includes(to))return bad('Solo puedes trasladar tropas entre zonas propias vecinas.');if(!Number.isInteger(amount)||amount<1||s.regions[from].troops-amount<1)return bad('Debes mantener al menos una unidad en la zona de origen.');const foodCost=Math.max(1,Math.ceil(amount/(4+s.technology.logistics)));if(s.resources.food<foodCost)return bad('No hay alimentos para la marcha.');s.resources.food-=foodCost;s.regions[from].troops-=amount;s.regions[to].troops+=amount;s.actions--;return success(s,`Marchan ${amount} unidades de ${region(from).name} hacia ${region(to).name}.`)}
export function negotiate(s,id){const err=requireAction(s);if(err)return err;const p=s.regions[id];if(!p||p.owner!=='independiente')return bad('Solo puedes negociar con territorios independientes.');if(!REGIONS.some(r=>own(s,r.id)&&r.links.includes(id)))return bad('Necesitas controlar un territorio vecino.');const c={food:10,wood:5};if(!cost(s,c))return bad('La negociación cuesta 10 alimentos y 5 maderas.');charge(s,c);s.actions--;
 const chance=Math.min(.85,.45+.06*s.technology.scouting+.03*(s.legitimacy-60)/10);
 if(rand(s)<chance){p.owner=s.faction;p.morale=67;s.stats.alliances++;s.legitimacy=Math.min(100,s.legitimacy+2);log(s,'alianza','Alianza con '+region(id).name,'Resultado simulado; no describe una alianza histórica documentada.');return {ok:true,description:'Acuerdo aceptado: '+region(id).name+'.'}}
 log(s,'diplomacia','Oferta rechazada en '+region(id).name);return {ok:true,description:'Oferta rechazada. Puedes insistir otro año.'};
}
export function research(s,key){const err=requireAction(s);if(err)return err;if(!['agriculture','logistics','tactics','scouting'].includes(key))return bad('Investigación desconocida.');const level=s.technology[key];if(level===3)return bad('Tecnología al máximo.');const c={wood:8+level*5,metal:8+level*5,food:4+level*2};if(!cost(s,c))return bad('Recursos insuficientes para investigación.');charge(s,c);s.technology[key]++;s.actions--;return success(s,({agriculture:'Agricultura',logistics:'Logística',tactics:'Tácticas',scouting:'Exploración'})[key]+' mejorada al nivel '+(level+1)+'.')}
export function trade(s,type){const err=requireAction(s);if(err)return err;const deals={food:{give:'wood',giveAmt:10,get:'food',getAmt:17},wood:{give:'food',giveAmt:14,get:'wood',getAmt:9},metal:{give:'wood',giveAmt:11,get:'metal',getAmt:6}};const d=deals[type];if(!d)return bad('Intercambio no disponible.');if(s.resources[d.give]<d.giveAmt)return bad('No hay recursos para el intercambio.');s.resources[d.give]-=d.giveAmt;s.resources[d.get]+=d.getAmt;s.actions--;return success(s,`Intercambio: -${d.giveAmt} ${d.give}, +${d.getAmt} ${d.get}.`)}
export function eligibleAttack(s,from,to){return s.status==='playing'&&s.actions>0&&!!region(from)&&!!region(to)&&neighbors(from).includes(to)&&own(s,from)&&s.regions[to].owner!==s.faction&&s.regions[from].troops>=3;}
export function forecastBattle(s,from,to){if(!eligibleAttack(s,from,to))return null;const atk=s.regions[from],def=s.regions[to],terrain=TERRAIN[region(to).terrain],weather=climateAt(s,to);
 const bonus=(s.technology.tactics*.11)+(s.technology.logistics*.04)+(atk.road*.025);
 const weatherFactor=weather.rainy?(s.scenario==='arauco'&&s.faction==='espanoles'?.86:.94):1;
 const attack=(atk.troops-1)*(1+bonus)*weatherFactor*(atk.morale/100+.25);
 const defense=(def.troops+def.fort*5)*terrain.def*(def.morale/100+.25);
 return {attack:Math.round(attack*10)/10,defense:Math.round(defense*10)/10,ratio:attack/Math.max(1,defense),weather,terrain:terrain.label};
}
export function battle(s,from,to,manualBonus=0){if(!eligibleAttack(s,from,to))return bad('Batalla no disponible: revisa tropas, turno y vecindad.');if(!Number.isFinite(manualBonus))return bad('Bonificación inválida.');const p=s.regions[from],q=s.regions[to],originOwner=q.owner,attacking=p.troops-1,defending=q.troops,forecast=forecastBattle(s,from,to);
 const att=forecast.attack*(.78+.44*rand(s))*(1+Math.max(-.25,Math.min(.5,manualBonus)));
 const def=forecast.defense*(.82+.36*rand(s));const victory=att>def;const lostA=Math.min(attacking,Math.max(1,Math.floor(attacking*(victory?.22:.43))));const lostD=Math.min(defending,Math.max(1,Math.floor(defending*(victory?.8:.38))));p.troops=1;
 if(victory){q.owner=s.faction;q.troops=Math.max(1,attacking-lostA);q.fort=Math.max(0,q.fort-1);q.morale=65;s.stats.victories++;s.legitimacy=Math.min(100,s.legitimacy+2);}else{p.troops=Math.max(1,attacking-lostA+1);q.troops=Math.max(1,defending-lostD);p.morale=Math.max(35,p.morale-5);s.stats.losses++;s.legitimacy=Math.max(0,s.legitimacy-2);}
 s.actions--;s.stats.battles++;
 let title=(victory?'Victoria':'Derrota')+' en '+region(to).name;
 log(s,'batalla',title,`El combate entre ${FACTIONS[s.faction].name} y ${FACTIONS[originOwner].name} causó ${lostA} bajas atacantes y ${lostD} defensoras. ${forecast.weather.name}; clima estimado, no observado.`);
 const event=(EVENTS[s.scenario]??[]).find(ev=>ev.location===to&&Math.abs(ev.year-s.year)<=2);if(event){s.history.events[event.year]={title:event.name,simulationWinner:victory?s.faction:originOwner,historicalWinner:event.historicalWinner??null};if(event.historicalWinner){const same=event.historicalWinner===(victory?s.faction:originOwner);s.history.branch=same?'coincidencia parcial':'historia alternativa';log(s,'historia',same?'Resultado de partida coincidente':'La historia toma otro rumbo',`${event.name}: desenlace simulado ${FACTIONS[victory?s.faction:originOwner].name}. El resultado histórico documentado no cambia.`)}}
 evaluate(s);return {ok:true,victory,attackerLosses:lostA,defenderLosses:lostD,description:title};
}
function aiTurn(s){const enemy=opposite(s);const front=REGIONS.filter(r=>s.regions[r.id].owner===enemy&&r.links.some(n=>s.regions[n].owner===s.faction));
 // La facción rival no obtiene acciones gratis sin límite: como máximo un ataque y un refuerzo cada año.
 const eligible=front.flatMap(r=>r.links.filter(n=>s.regions[n].owner===s.faction).map(n=>({from:r.id,to:n}))).filter(x=>s.regions[x.from].troops>Math.max(5,s.regions[x.to].troops*1.35+s.regions[x.to].fort*4));
 if(eligible.length&&rand(s)<.70){const move=eligible[Math.floor(rand(s)*eligible.length)],a=s.regions[move.from],d=s.regions[move.to];const atk=a.troops-1;const force=atk*(.85+.35*rand(s));const defense=(d.troops+d.fort*5)*TERRAIN[region(move.to).terrain].def*(.83+.3*rand(s));const win=force>defense;a.troops=1;if(win){d.owner=enemy;d.troops=Math.max(1,Math.floor(atk*.7));d.fort=Math.max(0,d.fort-1);log(s,'rival','Avance enemigo en '+region(move.to).name,'La IA rival capturó el territorio; abastecimiento y tropas afectados.');}else{a.troops=Math.max(1,Math.floor(atk*.6));d.troops=Math.max(1,Math.floor(d.troops*.8));log(s,'rival','Ataque rival repelido en '+region(move.to).name);}}
 const options=REGIONS.filter(r=>s.regions[r.id].owner===enemy);if(options.length){const at=options[Math.floor(rand(s)*options.length)];s.regions[at.id].troops=Math.min(45,s.regions[at.id].troops+3);}
}
function applyEvents(s){for(const ev of EVENTS[s.scenario]??[]){if(ev.year!==s.year||s.history.events[ev.year])continue;const owner=s.regions[ev.location]?.owner??'independiente';let alt=ev.historicalWinner&&owner!==ev.historicalWinner;
 s.history.events[ev.year]={title:ev.name,historicalWinner:ev.historicalWinner??null,simulationOwner:owner,alternative:Boolean(alt)};
 if(alt)s.history.branch='historia alternativa';
 log(s,'historia',ev.name,ev.fact+' Estado en TU campaña: '+FACTIONS[owner].name+'. '+(alt?'Esta línea histórica alternativa no reproduce el resultado documentado.':'La situación geopolítica del juego puede coincidir parcialmente, no recrea la batalla exacta.'));}}
function finish(s,status,reason){s.status=status;s.result={year:s.year,status,reason,provinces:ownedCount(s),battles:s.stats.battles};log(s,'final',status==='won'?'Victoria de campaña':status==='lost'?'Derrota de campaña':'Fin de campaña',reason);}
function evaluate(s){if(s.status!=='playing')return;const owned=ownedCount(s),enemy=ownedCount(s,opposite(s));if(owned===0){finish(s,'lost','Todas las posiciones fueron perdidas.');return;}if(enemy===0&&owned>=Math.ceil(TOTAL*.68)){finish(s,'won','Se neutralizó a la principal facción rival y se mantuvo el control territorial.');return;}if(s.turn>=4&&owned>=Math.ceil(TOTAL*.75)&&ownedCount(s,opposite(s))<=Math.floor(TOTAL*.15)){finish(s,'won','Control territorial y capacidad estratégica suficientes para imponer el resultado.');return;}if(s.year>=SCENARIOS[s.scenario].end){if(owned>enemy)finish(s,'won','La campaña terminó con ventaja territorial sobre el rival.');else if(owned<enemy)finish(s,'lost','El rival terminó con más territorios bajo su control.');else finish(s,'finished','Empate territorial al cierre de la era.');}}
export function endTurn(s){if(s.status!=='playing')return bad('La campaña ya terminó.');s.turn++;s.year++;
 let income={food:0,wood:0,metal:0},upkeep=0;for(const r of REGIONS){const x=s.regions[r.id];if(x.owner!==s.faction)continue;income.food+=r.output.food+x.farm*4;income.wood+=r.output.wood;income.metal+=r.output.metal;upkeep+=Math.ceil(x.troops/(6+s.technology.logistics));}
 income.food=Math.floor(income.food*(1+s.technology.agriculture*.13));s.resources.food=Math.min(999999,Math.max(0,s.resources.food+income.food-upkeep));s.resources.wood=Math.min(999999,s.resources.wood+income.wood);s.resources.metal=Math.min(999999,s.resources.metal+income.metal);
 if(s.resources.food===0){for(const r of REGIONS){const x=s.regions[r.id];if(x.owner===s.faction){x.troops=Math.max(1,x.troops-2);x.morale=Math.max(20,x.morale-5)}}s.legitimacy=Math.max(0,s.legitimacy-4);log(s,'crisis','Escasez de alimentos','La guarnición pierde fuerza por falta de provisiones.');}
 aiTurn(s);applyEvents(s);s.actions=4;log(s,'turno','Año '+s.year,`Recursos: +${income.food} alimentos, +${income.wood} madera, +${income.metal} metal; consumo militar ${upkeep}.`);evaluate(s);return {ok:true,description:s.status==='playing'?'Comienza el año '+s.year:'Campaña concluida en '+s.year};}
export function exportSave(s){if(!validateState(s))throw Error('Partida incompatible');return JSON.stringify(s)}
export function importSave(text){let s=JSON.parse(text);if(s?.schema===1){return migrateV1(s)}if(!validateState(s))throw Error('Guardado corrupto o incompatible');return s;}
export function migrateV1(old){if(!old||old.schema!==1||!['mapuche','espanoles'].includes(old.faction)||!old.resources||!old.regions)return (()=>{throw Error('Partida antigua inválida')})();const s=newCampaign(old.faction,old.worldSeed??1541,'arauco');for(const key of Object.keys(old.regions)){const a=old.regions[key],b=s.regions[key];if(!b||!a||!Object.hasOwn(FACTIONS,a.owner)||!Number.isInteger(a.troops)||a.troops<0||!Number.isInteger(a.fort))throw Error('Partida antigua corrupta');b.owner=a.owner;b.troops=a.troops;b.fort=Math.max(0,Math.min(3,a.fort));}s.year=Math.max(1541,Math.min(1641,old.year??1541));s.turn=Math.max(0,old.turn??0);s.seed=(old.seed??1541)>>>0;for(const k of ['food','wood','metal']){let n=old.resources[k];if(!Number.isSafeInteger(n)||n<0)throw Error('Recursos del guardado antiguo inválidos');s.resources[k]=Math.min(999999,n);}s.history.branch=old.history?.branch??'historia abierta';log(s,'sistema','Partida 0.1 migrada','Se conservaron territorios, tropas, fortificaciones y recursos; las zonas nuevas se inicializan.');if(!validateState(s))throw Error('Migración fallida');return s;}