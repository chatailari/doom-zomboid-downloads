# FRONTERA DE FUEGO 0.4.0 · Ciudades y guerras (prototipo)

La campaña conserva los episodios cronológicos de la v0.3.0. Se suma una **capa económica persistente** orientada a Caesar, SimCity y Age of Empires sin copiar propiedad intelectual ni recursos audiovisuales de esas franquicias.

## Bucle de juego
1. Fundar un asentamiento y elegir bando/era.
2. Construir viviendas, cultivos, taller/aserradero, mina, mercado/intercambio, cuartel, escuela de oficios, defensas.
3. Pasar estaciones (máximo ocho por episodio) para producir comida, madera, metal y monedas; consumir comida y permitir crecimiento de habitantes condicionado por viviendas y bienestar. La falta de alimentos provoca emigración y caída de moral.
4. Investigar con recursos y escuela de oficios: agricultura, metalurgia, organización. Estas inversiones y los edificios militares mejoran las posibilidades de la batalla.
5. Reclutar tropas desde población civil, escoger táctica y resolver el episodio histórico. El siguiente año solo se desbloquea al ganar.
6. Conservar habitantes, edificios y avances en el siguiente capítulo.

## Persistencia y compatibilidad
- Guardado v0.4.0: `frontera_defuego_ciudades_v4` (no sobreescribe los datos v0.3.0).
- Migración v0.3.0: se lee `frontera_defuego_historia_guiada_v3` cuando v4 no existe y se le agrega un asentamiento inicial. El formato JSON de campañas v3 sigue aceptado, el nuevo esquema económico es opcional en los guardados anteriores.
- Se preserva `clasico.html` como entrada independiente a modo libre 0.2.0.
- No se modifica la APK ni `frontera-de-fuego/channel.json`.

## Historiografía
Los años y eventos son hitos documentados; la topografía del mapa es artística, el clima y la economía se simulan. Construcciones, cifras, crecimiento y bonificaciones están inventadas para equilibrar el juego. Para el bando mapuche se adaptan los nombres visibles (rucas, intercambio, reunión de guerreros), sin atribuirle de manera automática edificaciones europeas.

## Verificación
- `node --test test_story.mjs test_settlement.mjs` (28 casos automáticos).
- `python3 build_story_offline.py` (genera `juego_offline.html`).
- `python3 test_browser_city.py` (Chromium móvil con HTML autocontenido y almacenamiento simulado; prueba construir, producir, guardar, reanudar y desbloquear siguiente episodio; sin prueba en Android físico).

## Pendientes declarados
Es un **prototipo jugable**, no Caesar/SimCity/Age of Empires completo: falta planificación espacial con colocación libre, rutas de transporte, suministro por trayectos, agentes pobladores, edificios dibujados con arte original, batallas FPS reales, georreferenciación DEM, más campañas y APK firmada compatible con canal de actualizaciones.