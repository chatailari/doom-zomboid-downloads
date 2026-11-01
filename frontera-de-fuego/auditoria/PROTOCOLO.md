# FRONTERA DE FUEGO | Protocolo de continuidad y no regresión

## Fuente única de verdad

- Resumen legible: [RESUMEN.md](./RESUMEN.md)
- Estado procesable: [estado.json](./estado.json)
- Historial filtrable: [historial.jsonl](./historial.jsonl)
- Evidencia por ejecución: [runs/](./runs/)
- CI que recolecta y guarda evidencias: [frontera-auditoria.yml](../../.github/workflows/frontera-auditoria.yml)
- Validación de integridad: [test_frontera_audit.py](../../tests/test_frontera_audit.py)
- Liberación firmada protegida: [frontera-v017-publicar-manual.yml](../../.github/workflows/frontera-v017-publicar-manual.yml)

La auditoría se ejecuta cuando termina un workflow de Frontera relevante, vuelve a conciliar runs recientes diariamente y puede reejecutarse manualmente por identificador. **Solo archiva runs ya terminados.** Cada JSON conserva pasos acertados, fallidos y omitidos, tiempos, SHA del código, resultado, identificadores de artefactos y enlace a GitHub Actions. No se copian logs crudos ni secretos.

## Baseline preservado

- **0.1.6**, `versionCode=7`: versión anunciada actualmente por el canal RSA de Frontera de Fuego. SHA-256 informado por el canal: `2caf1a200d70293cddce8712744e6ccd6884bc1e977638f699495fc42f216322`. Esta referencia es un punto de recuperación, **NO** una certificación de seguridad, ausencia de advertencia Play Protect ni funcionamiento completo en teléfono.
- **0.1.7**, `versionCode=8`: código del icono adaptable corregido y APK **sin firma** compilada correctamente (run `41350056549`). No publicarla como APK instalable.
- Run `41350177159`: se recompiló 0.1.7 correctamente; falló la fase **Require original signing credentials**, sin APK firmada, sin publicación y sin cambio de canal.
- [PR #4](https://github.com/chatailari/doom-zomboid-downloads/pull/4): rama de corrección de icono con fuente y pruebas. Mantener registro aunque las ramas se fusionen.
- [Incidencia #3](https://github.com/chatailari/doom-zomboid-downloads/issues/3): aviso Play Protect y estabilidad de Android al reiniciar. No inferir falsos positivos sin análisis.
- **Prueba física de 0.1.7**: pendiente.

## Errores conocidos y contramedidas

| Causa | Dónde se detectó | Contramedida | Situación |
|---|---|---|---|
| Verificación de versión antigua después del cambio a 0.1.7 | 41349673211 | Ejecutar pruebas de fuente 0.1.6 **antes** de incrementar versión | Resuelto en CI |
| Se buscaban nombres PNG sin empaquetar dentro de la APK | 41349893200 | Revisar imágenes generadas en carpeta de recursos y versión APK con AAPT | Resuelto en CI |
| Credenciales Android originales ausentes | 41350177159 | Comprobación anticipada de secrets antes de compilar o firmar | **Bloqueo externo pendiente** |
| Advertencia Google Play Protect | Captura del teléfono | Auditar APK real, permisos, dependencias y firma; no desactivar Play Protect | Pendiente |
| Bug Android al reiniciar | Relato del usuario | Capturar mensaje/log y reproducir antes de atribuirlo a la APK | Pendiente |

## Criterios exigentes para promover una versión

1. Compilar a partir de fuentes identificadas por SHA y superar pruebas de lógica y actualización.
2. Verificar `applicationId`, `versionCode` creciente, iconos y paquete.
3. Firmar **solo** con certificado Android original y comprobar su huella.
4. Instalar encima de la anterior y verificar ausencia de regresión y datos preservados.
5. Publicar APK y comprobar descarga pública y SHA-256.
6. Firmar con la **clave RSA original** el manifiesto, verificarlo y actualizar exclusivamente el canal Frontera.
7. Registrar el run, el artefacto, el hash y el alcance real de las pruebas. **No declarar teléfono probado desde una prueba de emulador.**
8. Conservar siempre la última publicación aprobada antes de promover la nueva. Si falla algo, se conserva la anterior.

## Desbloqueo de firma (sin publicar secretos)

Configurar en **GitHub → Settings → Secrets and variables → Actions**, usando el respaldo auténtico:
`FRONTERA_KEYSTORE_BASE64`, `FRONTERA_KEY_ALIAS`, `FRONTERA_KEY_PASSWORD`.
El manifiesto necesita su clave RSA original, según el nombre de secret ya previsto por el workflow.
Nunca inventar nuevas claves para sustituir estas identidades ni enviarlas a issues, repositorios o mensajes de chat.

El workflow manual **no inicia la compilación sin ambas credenciales originales**, para evitar reintentos costosos que ya sabemos que fallarán.

## Principio

**El historial de errores no se borra.** La vista resumida agrupa fallas recurrentes, registra los casos solucionados y conserva el último éxito real, para investigar solo diferencias nuevas. Las pruebas son evidencias delimitadas, no promesas.
