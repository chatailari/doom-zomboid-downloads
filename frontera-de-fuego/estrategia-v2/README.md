# FRONTERA DE FUEGO · Estrategia histórica (v0.2.0, prototipo jugable)

**Estado:** campaña estratégica 2D jugable y comprobada con pruebas unitarias y smoke test en Chromium. **NO** es un producto histórico completo ni una nueva APK Android. La APK 0.1.6 y su canal de actualización no se alteran.

## Cómo jugar

- **Rápido, sin instalar:** abre `juego_offline.html` en un navegador que permita abrir archivos locales. Es un documento HTML autocontenido; si el navegador restringe `localStorage` para archivos locales, exporta la partida desde **Guardar / Exportar**. Alternativamente sirve `index.html` por un servidor HTTP y permite conservar el almacenamiento de navegador.
- **Desarrollo local:** `python3 -m http.server 8000` en esta carpeta y visitar `http://localhost:8000`.
- Inicia **Conquista y Guerra de Arauco (1541 a 1641)** como fuerzas mapuches o españolas, o **Guerra de Independencia (1810 a 1826)** como patriotas o realistas.
- Obtienes **4 órdenes anuales**. Recluta, mueve tropas entre territorios propios vecinos, fortifica, cultiva, mejora caminos, comercia, investiga tecnologías o negocia.
- Para atacar: selecciona un territorio de origen desde el desplegable y luego un territorio enemigo vecino en el mapa. Elige batalla automática o **combate 2.5D experimental**. El resultado del FPS modifica una bonificación estratégica, **no** sustituye al motor táctico de batalla.
- **Finalizar año** produce recursos netos, activa el turno de IA y los eventos cronológicos. El juego puede terminar en victoria, derrota o empate al finalizar la era.
- Los datos se guardan automáticamente cuando es posible; también puedes descargar/importar una partida JSON. Se migran partidas del prototipo v1.

## Alcance jugable ahora

| Sistema | Estado |
|---|---|
| 2 campañas, 4 bandos | Implementado |
| 16 regiones conectadas | Implementado, mapa artístico **NO georreferenciado** |
| Terreno y climatología regional | Modelo aproximado; **no son registros del tiempo exacto en una batalla** |
| Economía (comida, madera, metal), guarniciones | Implementado |
| Transporte, reclutamiento, fortificaciones, cultivos y rutas | Implementado |
| Investigación, comercio, alianzas | Implementado |
| Batallas con cálculo táctico y bajas | Implementado |
| Rival IA limitado a refuerzo y un ataque por año | Implementado |
| Crónica, eventos históricos, desenlace alternativo | Implementado |
| Victoria/derrota/fin de campaña | Implementado |
| Guardado local, exportación e importación | Implementado; dependiendo del origen del navegador |
| FPS 3D histórico con animaciones completas | **Pendiente**; existe escena experimental 2.5D |
| Modelos de vestimenta 3D, edificios, relieve GIS y cambios meteorológicos reales | **Pendiente** |
| Todas las guerras de Chile y multijugador | **Pendiente** |
| APK actualizable y firmada en el canal existente | **NO publicada**; conservar firma y pruebas Android |

## Fuentes y límites históricos

Hechos de referencia:

- [Memoria Chilena: Guerra de Arauco](https://www.memoriachilena.gob.cl/602/w3-article-691.html)
- [Memoria Chilena: Independencia de Chile](https://www.memoriachilena.gob.cl/602/w3-article-692.html)
- [Memoria Chilena: Batalla de Maipú](https://www.memoriachilena.gob.cl/602/w3-article-94411.html)
- [Biblioteca Nacional Digital: mapa de Arauco y Valdivia (1870)](https://www.bibliotecanacionaldigital.gob.cl/bnd/632/w3-article-553671.html) (fuente posterior, no mapa de 1541).
- [IDE Chile: infraestructura de datos geoespaciales](https://www.ide.cl/)
- [Museo de Talca: armas españolas del siglo XVI](https://www.museodetalca.gob.cl/colecciones/armas-de-la-conquista-espanola/armas-blancas-y-defensivas-empleadas-en-la-conquista)

**Importante:** no hay datos diarios de lluvia para la mayoría de batallas coloniales, ni censos militares precisos para 1541. El juego etiqueta estos parámetros como simulados. El mapa tiene 16 regiones artísticas, no polígonos históricos/GIS. Algunas coaliciones son simplificaciones lúdicas; no representan a todos los pueblos indígenas como una sola entidad histórica.

## Pruebas

```bash
node --test test_engine.mjs
python3 build_offline.py
python3 browser_test.py
```

El smoke test en navegador usa Playwright con Chromium instalado y un origen inerte (`page.set_content`), porque en ciertos entornos las navegaciones a localhost/file están restringidas. Verifica clics, inicios de campaña, órdenes, transición anual y apertura/cierre de combate; **no** certifica la instalación en un teléfono físico ni el guardado persistente del navegador de archivos local.

## Arquitectura / no regresión

- `scenarios.mjs`: 16 territorios, 2 campañas, cronología, fichas de armamento, clima regional.
- `engine.mjs`: lógica de juego determinista, defensa de estado, IA, combates, diplomacia y formato de guardado v2.
- `index.html`: interfaz táctil, importaciones ES module, ideal para hosting web.
- `juego_offline.html`: compilación autocontenida del mismo código, creada por `build_offline.py`.
- `test_engine.mjs`: pruebas del motor.
- `browser_test.py`: pruebas de interacciones de interfaz en Chromium.

Desarrollo protegido en `feature/frontera-estrategia-historia-v1` bajo carpeta `frontera-de-fuego/estrategia-v2/`. El canal Android existente permanece intacto. No cambiar el `packageId`, la firma Android, la clave RSA de actualizaciones ni los identificadores de partidas sin migración y pruebas.

## Próxima integración Android

Para que la APK existente reciba este juego hay que integrar el frontend en la fuente Android firmada, comprobar actualización sobre 0.1.6 sin pérdida de datos y superar tests de Android 14. Los flujos anteriores muestran bloqueo en actualización de 0.1.7. **No anunciar APK disponible hasta que la compilación firmada, la publicación y la actualización física hayan pasado.**