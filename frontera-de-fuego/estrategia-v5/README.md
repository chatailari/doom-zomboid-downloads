# FRONTERA DE FUEGO · Escenario de asentamientos v0.5.0 (prototipo)

La versión v0.5 mantiene las dos campañas cronológicas y convierte la economía abstracta en un **mapa construido parcela a parcela**.

## Experiencia implementada
- **Mapa interactivo de 120 parcelas (12 × 10)**, con río, bosques, caza, suelo cultivable, praderas, cerros, minerales y caminos. Paisaje artístico, NO georreferenciado ni reconstrucción topográfica histórica.
- **16 tipos de construcciones**: viviendas, chacras, aserradero, mina, mercado, cuartel, escuela de oficios, murallas/palisadas, puesto de caza, corral, herrería, templo o espacio ceremonial, almacén, torre, fortín y caminos.
- **Construcción espacial**: se elige estructura y se toca una parcela compatible cercana al asentamiento; los fortines permiten expandir la zona de construcción. Los costos se cobran del inventario; no se superponen edificios.
- **Órdenes de trabajadores**: enviar leñadores al bosque, cazar en zona con fauna y reunir piedra en cerros o vetas; las reservas se agotan. Tres órdenes por estación, con reposición parcial de bosques/fauna; el mineral no se regenera.
- **Economía estacional y población**: actividades productivas necesitan trabajadores, la comida mantiene población y ejército, y hay crecimiento condicionado por viviendas, alimentación y bienestar. El clima regional simulado y las incursiones influyen en algunas estaciones. Ocho estaciones de preparación por episodio histórico.
- **Comercio**: un mercado habilita caravanas para comprar y vender alimentos, madera, metal o piedra por monedas. Las transacciones comprueban inventario y saldo.
- **Herrerías**: 5 madera + 9 metal + 6 monedas fabrican 7 equipos de armas, con bonificaciones para el combate histórico.
- **Ejército y defensa**: cuarteles reclutan grupos de 5 combatientes o exploradores desde población civil; murallas, atalayas y fortines elevan defensa y pueden frenar incursiones.
- **Cultura por bando**: p. ej., Mapuche emplea nombres de rucas, intercambio y espacio ceremonial. La representación visual es interpretativa, no un inventario arqueológico demostrado.
- **Campañas previas conservadas**: Arauco 1541→1641 e Independencia 1810→1826, con resultados históricos y alternativos identificados y temporadas que continúan entre capítulos.

## Cómo jugar desde el teléfono
1. Abre `index.html` en un servidor web, o `juego_offline.html` sin conexión.
2. Funda una campaña.
3. Usa la barra rápida encima del mapa para seleccionar viviendas o cultivos; toca parcelas marcadas en verde.
4. Toca bosques, fauna o cerros para enviar recolectores; coloca talleres y granjas. Pasa estaciones para obtener recursos.
5. Construye mercado para comerciar; forja armas y recluta desde el cuartel para fortalecer tu ejército.
6. Resuelve la batalla o el episodio político para desbloquear el siguiente acontecimiento histórico.

## Guardado y no regresión
- Nuevo guardado aislado: `frontera_defuego_mundo_v5`.
- Lectura compatible con `frontera_defuego_ciudades_v4` y `frontera_defuego_historia_guiada_v3`. Los datos anteriores no se sobrescriben ni eliminan; se generan posiciones espaciales de forma determinista para sus edificios.
- `clasico.html` preserva el juego libre anterior, separado.
- **No se modifica ninguna APK Android ni el canal firmado `frontera-de-fuego/channel.json`.**

## Pruebas
- `node --test test_story.mjs test_settlement.mjs test_world.mjs` (54 pruebas: motor, geografía lúdica, construcción, recursos, salarios materiales, cultura, armamento, comercio, tropas, persistencia y no regresión).
- `python3 build_offline.py`: empaqueta todos los módulos en un HTML local.
- `python3 test_browser_world.py`: prueba Chromium con vista de teléfono: mapa táctil de 120 casillas, construcción, recolección de madera, cambio estacional, guardado, carga y desbloqueo cronológico sin errores JavaScript.
- **Sin prueba física Android ni APK 0.5 firmada.**

## Limitaciones transparentes
Este prototipo no es un RTS 3D acabado: falta arte propio por edificio, rutas y transportes con agentes animados, población caminando con IA, fortificaciones modulares, mapas digitales DEM con datos GIS, más campañas históricas, diplomacia profunda, combate con soldados en pantalla y multijugador. La topografía, clima de cada batalla, cifras de ejército y producción son simulados o esquemáticos. No describirlos como evidencia documental.