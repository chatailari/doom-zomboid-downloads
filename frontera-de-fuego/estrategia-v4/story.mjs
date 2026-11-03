/** Frontera de Fuego · Campaña narrativa por episodios. Años y hechos reales; fuerzas, tiradas y resultados son ficción lúdica. */
import {REGION_INDEX, TERRAIN, ATTIRE, FACTIONS, climateAt, SOURCES} from './scenarios.mjs';
import {ensureSettlement,validateSettlement,newChapterSettlement,combatModifier} from './settlement.mjs';
export {REGION_INDEX,TERRAIN,ATTIRE,FACTIONS,climateAt,SOURCES};
export const VERSION=3;
export const CHAPTERS={
 arauco:[
  {year:1541,title:'Santiago en llamas',place:'mapocho',type:'battle',enemy:24,winner:'espanoles',source:'guerra',terrain:'valle',
   intro:'Michimalonco dirige el ataque a Santiago. La ciudad sufre graves daños, pero el asentamiento español sobrevive. ¿Cambiará el desenlace?',goal:'Decide la suerte de Santiago.',detail:'Choque en un valle atravesado por el río Mapocho. La cifra de tropas es inventada para el juego.'},
  {year:1550,title:'El avance hacia Penco',place:'penco',type:'battle',enemy:25,winner:'espanoles',source:'guerra',terrain:'costa',
   intro:'La campaña de Valdivia llega a la zona de Andalién y Penco. El control del litoral y las rutas al sur está en disputa.',goal:'Asegura el acceso a Penco.',detail:'El entorno de bahías, marismas y ríos complica los desplazamientos; los números son simulados.'},
  {year:1553,title:'Tucapel: el destino de Valdivia',place:'tucapel',type:'battle',enemy:32,winner:'mapuche',source:'guerra',terrain:'bosque',
   intro:'Lautaro emplea grupos sucesivos de guerreros para desgastar a las fuerzas de Valdivia. En la historia real, triunfan las fuerzas mapuches.',goal:'Gana Tucapel y reescribe las consecuencias.',detail:'En diciembre de 1553, Pedro de Valdivia cae tras la batalla. La reconstrucción táctica es jugable, no documental.'},
  {year:1554,title:'Marihueñu: batalla de los cerros',place:'arauco',type:'battle',enemy:34,winner:'mapuche',source:'guerra',terrain:'bosque',
   intro:'Lautaro derrota a Francisco de Villagra cerca de Marihueñu. Las alturas, los accesos y el desgaste se vuelven decisivos.',goal:'Toma la iniciativa en Marihueñu.',detail:'El episodio representa el conflicto de 1554; la localización del nodo es una abstracción regional.'},
  {year:1557,title:'El último camino de Lautaro',place:'mataquito',type:'battle',enemy:33,winner:'espanoles',source:'guerra',terrain:'rio',
   intro:'Lautaro muere tras un ataque español en la zona del río Mataquito. En esta campaña puedes impedirlo o consolidar ese desenlace.',goal:'Determina quién domina el Mataquito.',detail:'Río, vados y sorpresa son factores regionales plausibles; el tiempo del día exacto no está reconstruido.'},
  {year:1598,title:'Curalaba: el vuelco de la guerra',place:'puren',type:'battle',enemy:40,winner:'mapuche',source:'guerra',terrain:'bosque',
   intro:'Las fuerzas mapuches derrotan a Martín García Óñez de Loyola. El desenlace inicia cambios profundos en la frontera colonial.',goal:'Decide el resultado de Curalaba.',detail:'La batalla es real. El tamaño del ejército y el funcionamiento del combate aquí son simulaciones.'},
  {year:1641,title:'Parlamento de Quilín',place:'biobio',type:'council',enemy:30,winner:null,source:'guerra',terrain:'rio',
   intro:'Tras décadas de conflicto, llega un momento decisivo para la diplomacia. Los parlamentos también cambian las fronteras.',goal:'Alcanza un acuerdo o impón tus condiciones políticas.',detail:'Quilín fue un parlamento histórico. No lo transformamos falsamente en una batalla.'}
 ],
 independencia:[
  {year:1810,title:'La Primera Junta',place:'mapocho',type:'council',enemy:24,winner:null,source:'independencia',terrain:'valle',
   intro:'En Santiago se instala la Primera Junta Nacional de Gobierno. Las decisiones políticas pueden abrir caminos distintos para Chile.',goal:'Consigue apoyo para tu proyecto político.',detail:'La instalación de la Junta fue un acontecimiento político, no una batalla campal.'},
  {year:1814,title:'Rancagua: resistir o conquistar',place:'cachapoal',type:'battle',enemy:28,winner:'realistas',source:'independencia',terrain:'rio',
   intro:'El ejército patriota es derrotado históricamente en Rancagua. Puedes darle la victoria al otro bando y alterar la Reconquista.',goal:'Gana Rancagua.',detail:'2 de octubre de 1814; la batalla real fue una derrota patriota.'},
  {year:1817,title:'Chacabuco: el cruce de los Andes',place:'aconcagua',type:'battle',enemy:32,winner:'patriotas',source:'independencia',terrain:'valle',
   intro:'El Ejército Libertador cruza los Andes y derrota a las fuerzas realistas en Chacabuco.',goal:'Decide el control de la ruta hacia Santiago.',detail:'12 de febrero de 1817. El cruce cordillerano y la campaña son reales; las estadísticas del juego, no.'},
  {year:1818,title:'Maipú: el destino de la independencia',place:'mapocho',type:'battle',enemy:38,winner:'patriotas',source:'maipu',terrain:'valle',
   intro:'Maipú consolida militarmente la independencia en el registro histórico. Tu campaña puede producir un resultado distinto.',goal:'Gana Maipú.',detail:'5 de abril de 1818. Este nodo esquemático no representa la ubicación precisa de la batalla.'},
  {year:1826,title:'Chiloé: la última frontera',place:'chiloe',type:'battle',enemy:42,winner:'patriotas',source:'independencia',terrain:'archipielago',
   intro:'La campaña de Chiloé y el Tratado de Tantauco cierran un capítulo de la independencia. El mar afecta el abastecimiento.',goal:'Decide el control del archipiélago.',detail:'El acuerdo de Tantauco es histórico, pero los resultados alternativos son ficticios.'}
 ]
};
export const SIDES={arauco:['mapuche','espanoles'],independencia:['patriotas','realistas']};
export function stages(scenario){return CHAPTERS[scenario]??[]}
export function active(s){return stages(s?.scenario)[s?.step]??null}
export function createStory(scenario='arauco',faction='mapuche',seed=1541){
 if(!SIDES[scenario]?.includes(faction))throw new Error('Campaña o bando inválido');
 const s={schema:VERSION,scenario,faction,seed:seed>>>0,step:0,year:stages(scenario)[0].year,
 status:'playing',army:20,food:70,wood:35,metal:35,supply:1,intel:0,morale:75,
 prepared:0,retries:0,score:0,won:[],history:[],last:null,enemyLoss:0};
 ensureSettlement(s);return s;
}
const random=s=>{s.seed=(Math.imul(1664525,s.seed)+1013904223)>>>0;return s.seed/4294967296;};
const fail=reason=>({ok:false,reason});
function record(s,title,body,type){s.history.unshift({year:s.year,title,body,type});s.history=s.history.slice(0,30)}
export function prepare(s,kind){if(s.status!=='playing')return fail('La campaña ya terminó.');
 if(s.prepared>=3)return fail('Máximo tres preparativos por episodio. Entra en acción.');
 const changes={recruit:{food:13,metal:6},scout:{wood:9,food:6},supply:{food:10,wood:7}};
 const c=changes[kind];if(!c)return fail('Preparativo desconocido');
 if(kind==='recruit'&&ensureSettlement(s).population<15)return fail('Necesitas al menos 15 habitantes para reclutar.');
 if(s.food<c.food||(c.wood&&s.wood<c.wood)||(c.metal&&s.metal<c.metal))return fail('Faltan recursos. Puedes reabastecerte si fracasas en una misión.');
 s.food-=c.food;s.wood-=(c.wood??0);s.metal-=(c.metal??0);
 if(kind==='recruit'){ensureSettlement(s).population-=5;s.army+=7;}else if(kind==='scout')s.intel=Math.min(3,s.intel+1);else s.supply=Math.min(3,s.supply+1);
 s.prepared++;const names={recruit:'Llegaron 7 combatientes',scout:'Exploradores informaron del terreno',supply:'El ejército recibió suministros'};
 record(s,names[kind],'Preparativo completado. Queda por elegir la estrategia.','preparacion');return {ok:true,description:names[kind]};
}
const tactical={
 frontal:{name:'Ataque frontal',base:0.08},
 terreno:{name:'Aprovechar el terreno',base:0.09},
 sorpresa:{name:'Ataque sorpresa',base:0.02},
 reserva:{name:'Proteger las reservas',base:0.025}
};
export function odds(s,tactic='terreno'){
 const m=active(s);if(!m)return null;
 const t=tactical[tactic];if(!t)return null;
 const weather=climateAt({year:s.year,worldSeed:1541},m.place);
 const terrain=TERRAIN[m.terrain];
 let bonus=t.base;
 if(tactic==='terreno')bonus+=(['bosque','rio','cordillera','archipielago'].includes(m.terrain)?0.15:0.04);
 if(tactic==='sorpresa')bonus+=0.09*s.intel+(m.terrain==='bosque'?0.11:0);
 if(tactic==='reserva')bonus+=0.075*s.supply;
 if(tactic==='frontal'&&m.terrain==='valle')bonus+=0.09;
 if(weather.rainy){bonus+=(tactic==='frontal'?-0.12:0.025);}
 const strength=s.army*(0.8+s.morale/300)*(1+bonus+s.supply*.06+combatModifier(s));
 const enemy=Math.max(12,m.enemy-s.enemyLoss)*(0.95+(terrain.def-1)*.48);
 let chance=Math.max(.17,Math.min(.91,.52+(strength/enemy-1)*.34));
 if(m.type==='council')chance=Math.max(.2,Math.min(.9,chance+(tactic==='reserva'?.08:0)));
 return {chance:Math.round(chance*100),weather:weather.name,terrain:terrain.label,enemy:Math.round(enemy),strength:Math.round(strength), tactic:t.name};
}
export function resolve(s,tactic='terreno'){
 if(s.status!=='playing')return fail('La campaña está cerrada.');
 const m=active(s),prediction=odds(s,tactic);if(!m||!prediction)return fail('Estrategia inválida.');
 const rolled=random(s),victory=rolled<prediction.chance/100;
 const losses=Math.min(s.army-1,Math.max(1,Math.ceil(s.army*(victory?(m.type==='council'?0.04:.12):.20))));
 s.army-=losses;s.morale=Math.max(30,Math.min(100,s.morale+(victory?6:-8)));s.retries+=victory?0:1;
 const report={chapter:m.title,year:m.year,victory,roll:Math.round(rolled*100),chance:prediction.chance,tactic,losses,remaining:s.army};
 s.last=report;
 if(victory){
  s.score+=100+Math.max(0,60-s.retries*10)+Math.max(0,30-s.prepared*4);
  s.won.push({year:m.year,title:m.title,winner:s.faction,historicalWinner:m.winner,alternative:!!m.winner&&s.faction!==m.winner});
  record(s,m.type==='council'?'Acuerdo alcanzado':'Victoria en '+m.title,
   m.winner?`En tu partida ganó ${FACTIONS[s.faction].name}. En la historia documentada venció ${FACTIONS[m.winner].name}.`:'La resolución política de tu campaña es ficticia y no cambia el registro histórico.','victoria');
  s.status=s.step===stages(s.scenario).length-1?'won':'chapter-won';
 }else{
  s.enemyLoss=Math.min(m.enemy-10,s.enemyLoss+Math.max(2,Math.floor(m.enemy*.13)));
  s.food+=10;s.wood+=5;s.metal+=4;s.prepared=Math.max(0,s.prepared-1);
  record(s,'Resistencia y retirada',`La operación falló. Perdimos ${losses} combatientes. El rival quedó desgastado y recibiste suministros para intentarlo de nuevo.`,'derrota');
 }
 return {ok:true,description:victory?'Victoria. ¡El futuro cambia!':'Derrota. Puedes reorganizar y volver a intentarlo.',...report};
}
export function nextChapter(s){if(s.status!=='chapter-won')return fail('Antes debes resolver el episodio actual.');
 s.step++;const m=active(s);s.year=m.year;s.status='playing';s.army=Math.min(30,Math.max(20,s.army+6));s.food+=30;s.wood+=15;s.metal+=12;s.supply=1;s.intel=0;s.prepared=0;s.retries=0;s.last=null;s.enemyLoss=0;
 newChapterSettlement(s);
 record(s,'Se abre '+m.year+' · '+m.title,'Avanzan los años y aparece un nuevo episodio. La historia real sirve de marco y tus resultados siguen registrados.','capitulo');
 return {ok:true,description:'Nuevo episodio: '+m.title};
}
export function valid(s){
 if(!s||s.schema!==VERSION||!SIDES[s.scenario]?.includes(s.faction)||!Number.isInteger(s.step)||s.step<0||s.step>=stages(s.scenario).length)return false;
 if(s.year!==stages(s.scenario)[s.step].year||!['playing','chapter-won','won'].includes(s.status))return false;
 if(!Number.isInteger(s.seed)||s.seed<0||s.seed>0xffffffff)return false;
 for(const k of ['army','food','wood','metal','supply','intel','morale','prepared','retries','score','enemyLoss'])if(!Number.isInteger(s[k])||s[k]<0||s[k]>100000)return false;
 if(s.town&&!validateSettlement(s.town))return false;
 if(s.army<1||s.army>5000||s.supply>3||s.intel>3||s.prepared>3||s.morale>100||!Array.isArray(s.won)||s.won.length>stages(s.scenario).length||!Array.isArray(s.history)||s.history.length>30)return false;
 return true;
}
export function exportStory(s){if(!valid(s))throw new Error('Partida inválida');return JSON.stringify(s)}
export function importStory(raw){const s=JSON.parse(raw);if(!valid(s))throw new Error('Archivo de partida no válido');ensureSettlement(s);return s}