/** Datos del juego, mapas interpretativos. No utilizar como cartografía georreferenciada. */
export const FACTIONS = Object.freeze({
 espanoles:{name:'Expedición española', color:'#d7a966', emblem:'✠'},
 mapuche:{name:'Fuerzas mapuche y aliadas', color:'#73bc9b',emblem:'✦'},
 patriotas:{name:'Fuerzas patriotas',color:'#7bb3dc',emblem:'★'},
 realistas:{name:'Fuerzas realistas',color:'#e3a38f',emblem:'◆'},
 independiente:{name:'Comunidades y fuerzas locales',color:'#a1a8a2',emblem:'·'}
});
export const REGIONS = Object.freeze([
 {id:'aconcagua',name:'Aconcagua',x:46,y:8,terrain:'valle',links:['mapocho'],output:{food:6,wood:2,metal:3},river:'Río Aconcagua'},
 {id:'mapocho',name:'Mapocho · Santiago',x:48,y:17,terrain:'valle',links:['aconcagua','cachapoal'],output:{food:7,wood:2,metal:2},river:'Río Mapocho'},
 {id:'cachapoal',name:'Cachapoal · Rancagua',x:50,y:26,terrain:'rio',links:['mapocho','mataquito'],output:{food:6,wood:3,metal:2},river:'Río Cachapoal'},
 {id:'mataquito',name:'Mataquito · Curicó',x:42,y:35,terrain:'rio',links:['cachapoal','maule'],output:{food:5,wood:3,metal:1},river:'Río Mataquito'},
 {id:'maule',name:'Maule · Talca',x:43,y:44,terrain:'rio',links:['mataquito','itata'],output:{food:6,wood:4,metal:1},river:'Río Maule'},
 {id:'itata',name:'Itata · Chillán',x:43,y:53,terrain:'rio',links:['maule','biobio','penco'],output:{food:5,wood:4,metal:1},river:'Río Itata'},
 {id:'biobio',name:'Biobío',x:44,y:63,terrain:'rio',links:['itata','penco','arauco','tucapel'],output:{food:5,wood:5,metal:1},river:'Río Biobío'},
 {id:'penco',name:'Penco · Concepción',x:21,y:60,terrain:'costa',links:['itata','biobio','arauco'],output:{food:4,wood:3,metal:1},river:'Bahía de Concepción'},
 {id:'arauco',name:'Arauco',x:19,y:72,terrain:'bosque',links:['penco','biobio','tucapel','puren'],output:{food:4,wood:6,metal:1},river:'Ríos y humedales costeros'},
 {id:'tucapel',name:'Tucapel',x:50,y:74,terrain:'bosque',links:['biobio','arauco','puren','imperial'],output:{food:4,wood:6,metal:1},river:'Cuencas costeras de Arauco'},
 {id:'puren',name:'Purén · Lumaco',x:35,y:83,terrain:'bosque',links:['arauco','tucapel','imperial'],output:{food:4,wood:6,metal:1},river:'Cuenca del Lumaco'},
 {id:'imperial',name:'La Imperial',x:54,y:86,terrain:'rio',links:['tucapel','puren','valdivia','villarrica'],output:{food:5,wood:5,metal:1},river:'Cuenca del Imperial'},
 {id:'villarrica',name:'Villarrica',x:77,y:83,terrain:'cordillera',links:['imperial','valdivia'],output:{food:3,wood:6,metal:3},river:'Lago Villarrica y cuencas lacustres'},
 {id:'valdivia',name:'Valdivia',x:51,y:93,terrain:'rio',links:['imperial','villarrica','osorno'],output:{food:5,wood:6,metal:2},river:'Sistema fluvial de Valdivia'},
 {id:'osorno',name:'Osorno',x:56,y:103,terrain:'bosque',links:['valdivia','chiloe'],output:{food:5,wood:6,metal:1},river:'Río Rahue'},
 {id:'chiloe',name:'Chiloé',x:20,y:112,terrain:'archipielago',links:['osorno'],output:{food:5,wood:5,metal:1},river:'Canales y mar interior'}
]);
export const REGION_INDEX=Object.fromEntries(REGIONS.map(x=>[x.id,x]));
export const SCENARIOS=Object.freeze({
 arauco:{id:'arauco',name:'Conquista y Guerra de Arauco',start:1541,end:1641,
  description:'De la fundación de Santiago a la diplomacia de frontera. Resultados históricos y alternativos.',
  factions:['mapuche','espanoles'],owner:{mapocho:'espanoles',aconcagua:'independiente',cachapoal:'independiente',mataquito:'independiente',maule:'independiente',itata:'independiente',biobio:'independiente',penco:'independiente',arauco:'mapuche',tucapel:'mapuche',puren:'mapuche',imperial:'independiente',villarrica:'independiente',valdivia:'independiente',osorno:'independiente',chiloe:'independiente'},
  troops:{mapocho:19,arauco:18,tucapel:17,puren:15},capital:{espanoles:'mapocho',mapuche:'tucapel'},
  objectives:['Controlar dos tercios de las regiones antes de 1641','Sostener una alianza o superioridad territorial','Cambiar el desenlace de Tucapel y Curalaba']},
 independencia:{id:'independencia',name:'Guerra de Independencia',start:1810,end:1826,
  description:'La Patria Vieja, Reconquista y Patria Nueva pueden cambiar según la campaña.',
  factions:['patriotas','realistas'],owner:{aconcagua:'patriotas',mapocho:'patriotas',cachapoal:'realistas',mataquito:'independiente',maule:'independiente',itata:'realistas',biobio:'realistas',penco:'realistas',arauco:'independiente',tucapel:'independiente',puren:'independiente',imperial:'independiente',villarrica:'independiente',valdivia:'realistas',osorno:'realistas',chiloe:'realistas'},
  troops:{aconcagua:15,mapocho:20,cachapoal:15,itata:13,biobio:15,penco:16,valdivia:11,chiloe:14},capital:{patriotas:'mapocho',realistas:'penco'},
  objectives:['Controlar dos tercios del territorio','Defender tu capital y asegurar las rutas','Cambiar el resultado de Rancagua, Chacabuco o Maipú']}
});
export const SOURCES={
 guerra:'https://www.memoriachilena.gob.cl/602/w3-article-691.html',
 independencia:'https://www.memoriachilena.gob.cl/602/w3-article-692.html',
 maipu:'https://www.memoriachilena.gob.cl/602/w3-article-94411.html',
 mapa:'https://www.bibliotecanacionaldigital.gob.cl/bnd/632/w3-article-553671.html',
 geo:'https://www.ide.cl/',
 museo:'https://museo.precolombino.cl/aprende/pueblos-culturas/pueblos-originarios/mapuche/',
 armas:'https://www.museodetalca.gob.cl/colecciones/armas-de-la-conquista-espanola/armas-blancas-y-defensivas-empleadas-en-la-conquista',
 clima:'https://www.cr2.cl/arboles-como-archivos-climaticos-reconstruyendo-600-anos-de-historia-de-sequia-en-sudamerica-ladera-sur/'
};
export const EVENTS={
 arauco:[
 {year:1541,name:'Santiago y la resistencia del valle central',location:'mapocho',fact:'En septiembre de 1541 se produjo el ataque a Santiago liderado por Michimalonco.',source:'guerra'},
 {year:1550,name:'Andalién y Penco',location:'penco',fact:'Las campañas españolas de 1550 incluyeron enfrentamientos en torno al Biobío y Penco.',source:'guerra'},
 {year:1553,name:'Tucapel y la muerte de Valdivia',location:'tucapel',fact:'Lautaro y fuerzas mapuches derrotaron a las fuerzas españolas; murió Pedro de Valdivia.',source:'guerra',historicalWinner:'mapuche'},
 {year:1554,name:'Marihueñu',location:'arauco',fact:'Fuerzas mapuches vencieron a Francisco de Villagra.',source:'guerra',historicalWinner:'mapuche'},
 {year:1557,name:'Mataquito',location:'mataquito',fact:'Lautaro murió tras un ataque español en la zona del Mataquito.',source:'guerra',historicalWinner:'espanoles'},
 {year:1598,name:'Curalaba',location:'puren',fact:'La derrota española en Curalaba abrió una gran rebelión mapuche.',source:'guerra',historicalWinner:'mapuche'},
 {year:1641,name:'Parlamento de Quilín',location:'biobio',fact:'Se celebró el Parlamento de Quilín, un hito de diplomacia fronteriza.',source:'guerra'}
 ],
 independencia:[
 {year:1810,name:'Inicio del proceso revolucionario',location:'mapocho',fact:'Se instauró la Primera Junta Nacional de Gobierno en Santiago.',source:'independencia'},
 {year:1814,name:'Desastre de Rancagua',location:'cachapoal',fact:'La derrota patriota abrió la etapa de Reconquista española.',source:'independencia',historicalWinner:'realistas'},
 {year:1817,name:'Batalla de Chacabuco',location:'aconcagua',fact:'Las fuerzas del Ejército Libertador obtuvieron la victoria en Chacabuco.',source:'independencia',historicalWinner:'patriotas'},
 {year:1818,name:'Batalla de Maipú',location:'mapocho',fact:'La victoria patriota consolidó militarmente la Independencia.',source:'maipu',historicalWinner:'patriotas'},
 {year:1826,name:'Chiloé y el final del proceso',location:'chiloe',fact:'La incorporación de Chiloé marcó el fin de la resistencia realista en el archipiélago.',source:'independencia',historicalWinner:'patriotas'}
 ]
};
export const ATTIRE={
 espanoles:{name:'Expedición española siglo XVI',description:'Casco, capa, prendas de lana o lino y protecciones variables; arcabuces, lanzas, espadas y rodelas según función. No todos llevan coraza.',source:'armas'},
 mapuche:{name:'Guerreros mapuche siglo XVI',description:'Vestimentas textiles diversas según territorio; lanzas, macanas, arcos, y estrategias de movilidad. Evitar mezclar atuendos ceremoniales posteriores.',source:'museo'},
 patriotas:{name:'Ejército patriota siglo XIX',description:'Infantería con fusil de chispa y bayoneta, artillería y caballería; uniformes y prendas heterogéneas según unidad y suministro.',source:'independencia'},
 realistas:{name:'Ejército realista siglo XIX',description:'Infantería con mosquetes y bayonetas, caballería, artillería y uniformidad variable por unidad y momento.',source:'independencia'}
};
export const TERRAIN={valle:{label:'Valle intermontano',def:1,move:1},rio:{label:'Ríos y vados',def:1.13,move:1.12},bosque:{label:'Bosques y lomajes',def:1.23,move:1.25},costa:{label:'Costa y estuarios',def:1.09,move:1.1},cordillera:{label:'Cordillera y lagos',def:1.37,move:1.5},archipielago:{label:'Canales e islas',def:1.34,move:1.6}};
export function climateAt(s,id){const r=REGION_INDEX[id];if(!r)return null;const rainyBase={valle:0.19,rio:0.31,bosque:0.49,costa:0.39,cordillera:0.54,archipielago:0.60}[r.terrain];const year=s.year,seed=s.worldSeed??1541;const hash=(Math.imul(seed+year*1337+id.length*4201,1103515245)>>>0)%1000;const rainy=hash<rainyBase*1000;return {rainy,name:rainy?'Lluvia probable (simulada)':'Sin lluvia (simulada)',provenance:'Climatología aproximada de la región, NO registro meteorológico de la batalla.'}}