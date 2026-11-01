# FRONTERA DE FUEGO | Auditoría técnica

Registro generado a partir de la API de GitHub Actions. No contiene secretos ni logs completos.

**Corridas registradas:** 4.
**Última compilación aprobada:** 0.1.7 (run 41350177159).
**Última publicación aprobada por todos los controles CI:** ninguna
**Canal público observado:** 0.1.6 (solo versión anunciada).
**Prueba real en teléfono:** pendiente, NO certificada.

## Historial de ejecuciones (se preservan los errores)

| Run | Resultado | Compiló | Etapa fallida | Referencia |
|---|---|---|---|---|
| 41349673211 | failure | no | Apply launcher-icon fix and version 0.1.7 | [GitHub Actions](https://github.com/chatailari/doom-zomboid-downloads/actions/runs/41349673211) |
| 41349893200 | failure | no | Build Android APK without any signing keys | [GitHub Actions](https://github.com/chatailari/doom-zomboid-downloads/actions/runs/41349893200) |
| 41350056549 | success | sí | ninguna | [GitHub Actions](https://github.com/chatailari/doom-zomboid-downloads/actions/runs/41350056549) |
| 41350177159 | failure | sí | Require original signing credentials | [GitHub Actions](https://github.com/chatailari/doom-zomboid-downloads/actions/runs/41350177159) |

## Fallos agrupados (para no repetir diagnósticos)

- **COMPROBACION_DE_RECURSOS_APK**: 1 ocasión(es), último run 41349893200; Build Android APK without any signing keys.
- **FALTA_FIRMA_ANDROID_ORIGINAL**: 1 ocasión(es), último run 41350177159; Require original signing credentials.
- **PRUEBAS_DE_VERSION_EN_ORDEN_INCORRECTO**: 1 ocasión(es), último run 41349673211; Apply launcher-icon fix and version 0.1.7.

## Reglas

1. Cada ejecución conserva pasos, resultado, artefactos, SHA del código y URL en `runs/<id>.json`.
2. Los errores se clasifican y agrupan, sin borrar el historial de fallos.
3. Una compilación válida no implica APK firmada ni instalación exitosa.
4. Un canal firmado anunciado no demuestra que la app sea segura ni que Play Protect esté conforme.
5. Nunca actualizar un registro de publicación aprobada sin firma original, actualización Android 14, descarga pública y canal firmado.
6. No colocar claves, contraseñas ni logs completos en el repositorio.
