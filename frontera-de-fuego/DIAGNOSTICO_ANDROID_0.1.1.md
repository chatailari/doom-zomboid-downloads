# FRONTERA DE FUEGO 0.1.1 — diagnóstico verificable (31-10-2026)

## Objetivo
Primero una APK Android ARM64 con menús y actualizador realmente operativos. El juego y los combates vienen después. No regresión ni cambio de identidad de firma.

## Estado verificado
- Binario recuperado de Biblioteca: `FRONTERA_DE_FUEGO_0.1.1_BETA_ARM64.apk` (25.729.866 bytes), SHA-256 `2dac9fc53296bac3aea8ed7cfa6f644c29e1e424667be3101d95b74ed19cf2e6`.
- ZIP APK íntegro (128 entradas). Certificado público del firmante SHA-256 `823d6f6c52a5d47d6fd8d1a16a1d6447e98c19fa938427a90734b1cfb3a70ea0`. El mismo certificado aparece en 0.1.0. Existen bloques de firma v2/v3; queda pendiente comprobar su validez con apksigner en Android SDK.
- Godot 4.5.1: `assets/project.binary` ya configura `rendering/renderer/rendering_method=gl_compatibility` y `...mobile=gl_compatibility`. **No** cambiar otra vez a Compatibility como supuesta corrección: ya estaba así.
- Captura previa: renderizado de menús en Linux correcto. En emulador Android pantalla gris persistente y errores gráficos; no hay aún resultado comprobado en teléfono físico.
- El bytecode de `assets/scripts/menu.gdc` referencia `res://assets/update_public.pem`, pero **el APK no contiene `assets/assets/update_public.pem`**. Esto bloquea la verificación de firma del canal (salvo que exista una ruta alternativa comprobada, no demostrada).
- El código consulta `https://raw.githubusercontent.com/chatailari/doom-zomboid-downloads/main/frontera-de-fuego/channel.json`. Archivo consultado el 31-10-2026: su payload firmado sigue anunciando `version_code=1`, `version=0.1.0`, `apk_url=""`, `sha256=""`. No puede anunciar ni descargar 0.1.1.
- `assets/releases/channel.json` embebido también anuncia 0.1.0 con URL vacía. Sin evidencia de APK/publicación en Release para `frontera-v0.1.1`.

## Corrección mínima, conservando identidad
1. Recuperar el proyecto fuente que generó la APK 0.1.1 y el keystore Android original en el entorno seguro de compilación. **Jamás** subir claves privadas.
2. Garantizar que el certificado público `res://assets/update_public.pem` exista y que las opciones de exportación incluyan este archivo no-recurso (p.ej. `include_filter="*.pem,**/*.pem,*.json,**/*.json"`, ajustado al preset real). Probar el APK final verificando que el PEM está dentro. 
3. Obtener `adb logcat` y captura/screenshot de arranque con renderizado gráfico en Android físico. No atribuir la pantalla gris solo al motor o al teléfono sin logcat.
4. Recuperar la clave privada de firma **del manifiesto** en el entorno autorizado, comprobar la firma del manifiesto candidato 0.1.1 y existencia del archivo descargable real. Publicar el nuevo canal **solo después** de verificar release, URL y SHA-256, sin romper el canal de DOOM-ZOMBOID.
5. Compilar una siguiente versión con `versionCode` mayor y el **mismo certificado Android**, instalar sobre la actual sin desinstalar ni borrar configuraciones. Verificar botones, descarga, SHA-256, rechazo de manifiesto falso y consentimiento de instalación Android. Las APK nuevas exigen instalación Android, no basta un PCK incremental.
6. Registrar las pruebas en `Android físico / emulador` separadas de Linux, con hashes y capturas. Mantener copia recuperable de la APK 0.1.1.

## Regla de liberación
NO declarar que el actualizador funciona hasta superar todas las puertas: PEM incluido, canal vigente/firma válida, URL real, descarga y hash, instalación sobre versión previa con certificado idéntico y preservación de datos, interfaz visible en Android.

**Este documento no modifica el canal `main/frontera-de-fuego/channel.json`, ni las APK, ni los archivos de DOOM-ZOMBOID.**