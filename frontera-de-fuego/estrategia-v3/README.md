# FRONTERA DE FUEGO 0.3.0 - Historia por episodios

## Lo que se corrigió a partir de las pruebas reales en un teléfono

La versión 0.2.0 enseñaba 16 territorios desde el principio y no explicaba cómo se desbloqueaban las guerras. Ahora la página principal ofrece **modo Historia guiada**, que empieza en el primer año del conflicto y muestra un solo episodio activo. El mapa revela únicamente lugares abiertos.

- Conquista/Guerra de Arauco: **1541 Santiago, 1550 Andalién/Penco, 1553 Tucapel, 1554 Marihueñu, 1557 Mataquito, 1598 Curalaba, 1641 Quilín**. Quilín es diplomacia, NO una batalla.
- Independencia: **1810 Primera Junta, 1814 Rancagua, 1817 Chacabuco, 1818 Maipú, 1826 Chiloé**. La Primera Junta se resuelve con decisiones políticas, NO una batalla.
- La primera pantalla explica el objetivo concreto y 3 acciones: preparación, táctica y combate/negociación.
- Cada victoria desbloquea **solo** el siguiente capítulo, saltando años vacíos. Se registran resultados históricos o alternativos sin falsificar los hechos.
- Posibilidades calculadas según preparación, cantidad de combatientes, terreno, climatología regional simulada y azar. El jugador puede perder y reintentar, con desgaste de fuerzas y compensación limitada de recursos.
- Guardado separado en `frontera_defuego_historia_guiada_v3`, exportación e importación JSON. **El modo libre anterior** conserva su clave `frontera_defuego_estrategia_save_v2` y se accede por `clasico.html`.

## Limitaciones reconocidas

La campaña guiada v3 NO es un Total War ni un FPS 3D. La batalla es una **resolución táctica por elecciones y probabilidades**, todavía sin combate visual interactivo. El mapa es artístico y no georreferenciado; las cifras, el clima exacto y los efectos tácticos son simulados. El sistema original Android **NO se modificó**: no hay APK 0.3.0 firmada.

## Pruebas

```
node --test test_story.mjs
python build_story_offline.py
python test_browser_story.py
```

La prueba de navegador usa Chromium en un entorno local aislado, con `page.set_content` del HTML autocontenido. No verifica conexión real a Vercel, almacenamiento persistente en origen remoto ni instalación en teléfono físico. `juego_offline.html` funciona sin imports y permite la descarga manual del guardado si el navegador bloquea localStorage.

## Fuentes

- [Memoria Chilena / Guerra de Arauco](https://www.memoriachilena.gob.cl/602/w3-article-691.html)
- [Memoria Chilena / Lautaro](https://www.memoriachilena.gob.cl/602/w3-article-721.html)
- [Memoria Chilena / Independencia](https://www.memoriachilena.gob.cl/602/w3-article-692.html)
- [Memoria Chilena / línea cronológica del siglo XIX](https://www.memoriachilena.gob.cl/602/w3-propertyvalue-158834.html)
- [IDE Chile](https://www.ide.cl/)

## Archivos

- `index.html`: campaña guiada, frontend nuevo.
- `story.mjs`: motor cronológico por episodios.
- `scenarios.mjs`: base ya existente de geografía, armamento, clima y fuentes.
- `clasico.html` + `engine.mjs`: modo libre 0.2.0 preservado.
- `build_story_offline.py` + `juego_offline.html`: versión sin necesidad de módulos externos.
- `test_story.mjs`, `test_browser_story.py`: pruebas.

> No promocionar un APK a su canal original sin conservar la firma y pasar actualización sobre 0.1.6 en Android 14. La entrega actual es **web**.