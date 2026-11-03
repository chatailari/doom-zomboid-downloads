/** Fuentes de referencia verificables; las reconstrucciones llevan etiquetas explícitas. */
export const SOURCES = Object.freeze({
  colonialMap:'https://www.curriculumnacional.cl/recursos/mapa-territorio-chileno-inicio-colonia',
  conquestMap:'https://aprendoenlinea.mineduc.gob.cl/recursos/guerra-arauco-siglo-xvi',
  mapoteca:'https://www.bibliotecanacional.gob.cl/colecciones-especiales',
  territory:'https://www.memoriachilena.gob.cl/602/w3-article-808.html',
  arauco:'https://www.memoriachilena.gob.cl/602/w3-article-691.html',
  tucapel:'https://www.memoriachilena.gob.cl/602/w3-article-95492.html',
  climate1540:'https://www.cr2.cl/arboles-como-archivos-climaticos-reconstruyendo-600-anos-de-historia-de-sequia-en-sudamerica-ladera-sur/',
  climateRings:'https://journals.ametsoc.org/view/journals/clim/19/22/jcli3935.1.xml',
  dress:'https://museo.precolombino.cl/aprende/pueblos-culturas/pueblos-originarios/mapuche/',
  armory:'https://www.museodetalca.gob.cl/colecciones/armas-de-la-conquista-espanola/armas-blancas-y-defensivas-empleadas-en-la-conquista',
  arquebus:'https://www.museodetalca.gob.cl/colecciones/armas-de-la-conquista-espanola/armas-de-fuego-usadas-por-los-conquistadores',
  terrainData:'https://www.ide.cl/',
  mapucheCulture:'https://www.losprecolombinos.cl/wp/como-vivian/'
});
export const ENVIRONMENTS = Object.freeze({
  aconcagua:{relief:'Valle transversal, cordillera y quebradas',water:'Cuenca del río Aconcagua',vegetation:'Matorral y áreas cultivadas según ocupación',movement:'Corredores de valle; cruces de cauces',climate:'Mediterráneo de Chile central (referencia regional)',reference:'territory'},
  mapocho:{relief:'Valle intermontano y cerro Huelén',water:'Río Mapocho y cursos secundarios',vegetation:'Vegas, vegetación de ribera y áreas cultivadas',movement:'Valle apto para tránsito, pasos fluviales y posiciones elevadas',climate:'Mediterráneo, lluvias concentradas en meses fríos',reference:'territory'},
  maule:{relief:'Depresión intermedia, río y piedemonte',water:'Río Maule',vegetation:'Mosaico de praderas, bosques y riberas',movement:'El cruce del río condiciona el avance de tropas',climate:'Transición mediterránea hacia mayor humedad al sur',reference:'conquestMap'},
  biobio:{relief:'Amplio valle fluvial, lomajes y cordillera de la Costa',water:'Río Biobío',vegetation:'Riberas y bosques de la zona centro-sur',movement:'Las crecidas y los pasos de río afectan el abastecimiento',climate:'Mayor humedad relativa que Chile central, variación estacional',reference:'arauco'},
  tucapel:{relief:'Estribaciones y bosques próximos al sistema de Nahuelbuta',water:'Cursos de agua regionales; ubicación exacta del campo de batalla disputada',vegetation:'Bosque templado y claros',movement:'Emboscadas, ocultamiento y dificultad de caballería',climate:'Condiciones húmedas posibles, no lluvia documentada para la fecha precisa',reference:'tucapel'},
  arauco:{relief:'Costa, lomajes y sectores de cordillera de Nahuelbuta',water:'Humedales y cursos costeros regionales',vegetation:'Bosques y vegetación costera',movement:'Terreno boscoso limita velocidad y visibilidad',climate:'Templado húmedo regional, simulación no registro diario',reference:'arauco'},
  valdivia:{relief:'Sistema de valles fluviales y bosques templados',water:'Cuenca y sistema fluvial de Valdivia',vegetation:'Bosque templado lluvioso',movement:'Navegación fluvial relevante; barro y bosques dificultan caminos',climate:'Templado lluvioso; frecuencia de lluvia modelada, no observada en 1541',reference:'territory'}
});
export const HISTORY = Object.freeze([
  {year:1540,where:'Zona central',title:'Sequía reconstruida',kind:'reconstrucción paleoclimática',facts:'Investigaciones basadas en anillos de árboles muestran sequía en 1540; no permiten saber qué tiempo hizo en cada batalla.',source:'climate1540'},
  {year:1541,where:'Mapocho',title:'Fundación y destrucción de Santiago',kind:'documentado',facts:'Santiago fue fundada en febrero y atacada el 11 de septiembre por fuerzas dirigidas por Michimalonco.',source:'territory'},
  {year:1550,where:'Andalién y Penco',title:'Campañas en torno al Biobío',kind:'documentado',facts:'Enfrentamientos en la zona precedieron a la fundación de Concepción; intervienen españoles y aliados indígenas.',source:'arauco'},
  {year:1553,where:'Tucapel',title:'Victoria mapuche de Lautaro',kind:'documentado',facts:'Las fuerzas de Lautaro derrotaron a Valdivia, que murió tras la batalla. En el juego este resultado puede ser distinto.',source:'tucapel'},
  {year:1554,where:'Marihueñu',title:'Derrota de Villagra',kind:'documentado',facts:'Las fuerzas de Lautaro derrotaron a Francisco de Villagra; se agravó la crisis de los asentamientos españoles.',source:'arauco'},
  {year:1557,where:'Mataquito',title:'Muerte de Lautaro',kind:'documentado',facts:'Lautaro murió en una incursión española en las cercanías del río Mataquito.',source:'arauco'},
  {year:1598,where:'Curalaba',title:'Derrota del gobernador Óñez de Loyola',kind:'documentado',facts:'El triunfo indígena precedió al abandono o caída de ciudades españolas al sur del Biobío.',source:'arauco'}
]);
export const COSTUMES=Object.freeze({
  espanoles:{label:'Expedición hispana, mediados del siglo XVI',imageHint:'Textiles de lana o lino, capas funcionales, casco, cota o peto según recursos',items:['Espada y lanza o pica según rol','Rodela o adarga, protección variable','Arcabuz para tropas específicas; recarga lenta y pólvora vulnerable al agua','Caballería solo donde el terreno lo permite'],exclusions:['No todos usan armadura completa de placas','No hay uniformes nacionales modernos'],source:'armory'},
  mapuche:{label:'Poblaciones reche-mapuche, mediados del siglo XVI',imageHint:'Tejidos locales y prendas funcionales; variación entre territorios y grupos',items:['Macana, lanza, arco u otras armas según zona y período','Protección y vestimenta no uniformes','Conocimiento del bosque y de los pasos como ventaja táctica','Adaptación gradual de técnicas y elementos introducidos por europeos'],exclusions:['No usar platería ceremonial del siglo XIX como atuendo típico de 1541','No asignar caballería generalizada a todos los grupos en 1541'],source:'dress'}
});
export function climateForCampaign(state,regionId){
  const region=ENVIRONMENTS[regionId];if(!region)return null;
  const wetRegion=['tucapel','arauco','valdivia','biobio'].includes(regionId);
  const z=((Math.imul((state.worldSeed??1541)|0,1103515245)+(state.year|0)*977+regionId.length*733)>>>0)%100;
  const rainy=z<(wetRegion?45:19);
  return {name:rainy?'Lluvia simulada':'Sin lluvia simulada',rainy,provenance:'simulación climática regional; NO registro del día histórico',description:region.climate};
}