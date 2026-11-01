# FRONTERA DE FUEGO | Una petición, un lanzamiento

**Entrada única:** `frontera-de-fuego/release-requests/current.json`.

Al modificar ese archivo en `main`, GitHub ejecuta automáticamente [frontera-una-orden.yml](../../.github/workflows/frontera-una-orden.yml), que valida identidad, versión y fuente, y llama al flujo reutilizable [frontera-v017-publicar-manual.yml](../../.github/workflows/frontera-v017-publicar-manual.yml).

## Resultado buscado

1. Recuperar fuente identificada por commit/SHA-256, aplicar parche y pasar pruebas.
2. Compilar Android con Gradle; firmar exclusivamente con el certificado original y confirmar huella.
3. Instalar la nueva APK **encima** de la previa en emulador Android 14; guardar evidencia.
4. Publicar en GitHub Releases **sin sobrescribir otra APK**, comparar SHA-256 de la descarga pública.
5. Firmar y verificar el manifiesto RSA de actualización. Promover `frontera-de-fuego/channel.json` solo después de comprobar APK pública.
6. Archivar resultados y errores en [auditoría](../auditoria/RESUMEN.md). Conservar la versión anterior si falla algo.

## Estado comprobado 01-11-2026

La solicitud inicial `0.1.7` **sí activó el flujo** ([run 41361279054](https://github.com/chatailari/doom-zomboid-downloads/actions/runs/41361279054)); la validación inicial pasó. Se bloqueó en `Require original signing credentials`: los secretos originales **no están configurados** en GitHub Actions. No se compiló ni publicó esta ejecución. El canal permanece en `0.1.6`.

## Requisito de configuración único, no es una tarea por cada versión

Guardar en GitHub Actions Secrets del repositorio **los valores originales**, usando un administrador autenticado:
- `FRONTERA_KEYSTORE_BASE64` (PKCS#12 original codificado base64), `FRONTERA_KEY_ALIAS` y `FRONTERA_KEY_PASSWORD`.
- `FRONTERA_MANIFEST_PRIVATE_KEY_BASE64` (RSA privada original codificada base64).
- Si `GITHUB_TOKEN` vuelve a recibir HTTP 403 al publicar: habilitar el permiso efectivo `contents: write` o definir un `FRONTERA_PUBLISH_TOKEN` de alcance mínimo al repositorio y `Contents: Read and write`.

**No crear firmas nuevas, no copiar secretos en commits, issues o mensajes.** La conexión de ChatGPT disponible permite escribir archivos GitHub, pero **no administrar Actions Secrets ni permisos del repositorio**.

## Próximas actualizaciones

Para cambiar únicamente el icono u otro elemento, el agente prepara y verifica el parche de la versión correspondiente, conserva el commit exacto y actualiza la solicitud. Actualmente el flujo reutilizable está fijado a **0.1.7**; una versión nueva necesita actualizar esa definición de origen/código/versiones antes de enviar una nueva solicitud. **No afirmar que ya es genérico para todas las versiones**.

Este sistema elimina múltiples solicitudes de «sigue» para lanzar una versión cuando los permisos y secretos estén disponibles. La duración del trabajo de GitHub y la prueba en un teléfono físico no se pueden garantizar dentro de la misma respuesta normal de chat.
