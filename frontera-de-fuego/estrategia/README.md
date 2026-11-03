# FRONTERA DE FUEGO | prototipo de estrategia histórica

## Alcance implementado
Prototipo web jugable y aislado de la APK: siete territorios conectados en un mapa esquemático, dos bandos, reclutamiento, fortificaciones, negociación, batallas automáticas, demostración FPS con perspectiva simulada (no 3D real), economía, registro de resultados, guardado local, fichas de relieve/vestimenta y atlas de siete hitos históricos con referencias.

Para ejecutarlo, servir este directorio como contenido web estático. Los módulos ES no siempre se cargan abriendo index.html directamente desde el sistema de archivos.

**No es una APK, mapa real a escala, ni motor FPS 3D completo.** Este prototipo no modifica la firma Android ni el canal de la versión publicada.

## Regla: tres niveles de evidencia
- Documentado: fechas de campañas y batallas cuya existencia fue corroborada en fuentes.
- Reconstrucción: conclusiones historiográficas o paleoclimáticas con incertidumbre, como la sequía de 1540.
- Simulación: tiempo por turno, resolución de batallas, tropas, recursos, diplomacia y resultados alternativos. Nunca se presenta como meteorología histórica diaria.

Las regiones del mapa son zonas narrativas y operativas simplificadas, no fronteras políticas auténticas de 1541. Las coaliciones mapuches y otros grupos fueron diversos, por lo que se evitará mostrarlos como entidades homogéneas.

## Fuentes principales
- Memoria Chilena, Guerra de Arauco: https://www.memoriachilena.gob.cl/602/w3-article-691.html
- Batalla de Tucapel: https://www.memoriachilena.gob.cl/602/w3-article-95492.html
- Territorios y ciudades coloniales: https://www.memoriachilena.gob.cl/602/w3-article-808.html
- Ministerio de Educación, mapa Guerra de Arauco: https://aprendoenlinea.mineduc.gob.cl/recursos/guerra-arauco-siglo-xvi
- Currículum Nacional, mapa colonial: https://www.curriculumnacional.cl/recursos/mapa-territorio-chileno-inicio-colonia
- Museo de Arte Precolombino, cultura mapuche: https://museo.precolombino.cl/aprende/pueblos-culturas/pueblos-originarios/mapuche/
- Museo de Talca, armas defensivas: https://www.museodetalca.gob.cl/colecciones/armas-de-la-conquista-espanola/armas-blancas-y-defensivas-empleadas-en-la-conquista
- Museo de Talca, arcabuces y efectos de lluvia: https://www.museodetalca.gob.cl/colecciones/armas-de-la-conquista-espanola/armas-de-fuego-usadas-por-los-conquistadores
- CR2, sequía reconstruida para 1540: https://www.cr2.cl/arboles-como-archivos-climaticos-reconstruyendo-600-anos-de-historia-de-sequia-en-sudamerica-ladera-sur/
- Investigación de anillos de árboles 1200-2000: https://journals.ametsoc.org/view/journals/clim/19/22/jcli3935.1.xml
- IDE Chile, capas geográficas oficiales: https://www.ide.cl/

No incorporar imágenes de otros titulares sin comprobar licencias ni permisos.

## Pendientes para versión completa
1. Mapas de época por campaña y datos DEM de elevación, cauces y pendientes con procedencia y licencia.
2. Microclimas regionales y reconstrucción paleoclimática con intervalos de incertidumbre; sin inventar lluvia de una fecha no documentada.
3. Figuras, ropajes, armas y equipamiento diferenciados por región y año, revisados para evitar anacronismos.
4. Batallas y liderazgo: 1541, 1550, Tucapel 1553, Marihueñu 1554, Mataquito 1557, Curalaba 1598; expansión posterior a siglos XVII-XIX.
5. Batallas FPS verdaderas en Godot con IA, ejército persistente y efectos en el mapa.
6. Integración Android manteniendo identificador y certificado original, pruebas de actualización Android 14, preservación de datos y canal firmado.

## Pruebas
Comando local: node --test test_engine.mjs. Se ejecutaron 12 pruebas unitarias, todas aprobadas. La prueba de interfaz Chromium fue bloqueada en el entorno de ejecución y NO se considera certificación Android.
