# FRONTERA DE FUEGO 0.1.2 — punto de recuperación verificado (1 nov 2026)

## APK entregable candidata (no certificada en Android)
Archivo: `FRONTERA_DE_FUEGO_0.1.2_BETA_ARM64_CANDIDATA.apk`
Tamaño: 25.729.722 bytes
SHA256: `28d4b6a097822d5989172f526897e03b5b2ac4140dfe15f7aa04302b1e69095b`
Identificador: `cl.nazaret.fronteradefuego`
Android: `versionCode=3`, `versionName=0.1.2`
Certificado SHA256: `823d6f6c52a5d47d6fd8d1a16a1d6447e98c19fa938427a90734b1cfb3a70ea0` (idéntico al de 0.1.0/0.1.1).

## Procedimiento utilizado
Por carecer este entorno de Godot/SDK/ADB, **no se compiló de nuevo la fuente**. Se realizó una reparación binaria de la APK v0.1.1 preservando escenas, librerías y recursos, incorporando `assets/assets/update_public.pem`, añadiendo `assets/update_public.pem` al índice `assets.sparsepck`, actualizando hash/longitud de entradas modificadas, las constantes `APP_CODE=3` / `APP_VERSION=0.1.2` del GDScript precompilado y el manifiesto Android. Se firmó v1/v2/v3 con la identidad Android original en entorno privado. No se distribuyeron claves.

## Verificación concreta
- ZIP íntegro, 129 entradas; 12 entradas del índice Godot verificadas por tamaño y MD5.
- AndroidManifest: paquete + versión comprobados en AXML binario.
- Firmas RSA v2 y v3 y digests válidos y certificado idéntico; v1 revisada por jarsigner (certificado autofirmado esperado).
- Bibliotecas nativas sin comprimir y alineadas 4096 bytes.
- Prueba negativa: APK alterada rechazada por digest de firma.
- Generador del próximo canal RSA offline implementado, con APK y PCK en un mismo payload firmado; 10 pruebas automatizadas pasan.
- Informe y fuente reutilizable disponibles como archivos adjuntos dentro de la conversación (no en este repositorio). La fuente v0.1.2 reconstruida deriva de 0.1.0 y **NO equivale byte a byte** a la APK reparada.

## Bloqueos no resueltos
1. No se ha instalado o abierto 0.1.2 en Android físico; la pantalla gris no puede declararse resuelta.
2. No se verificó el botón ACTUALIZAR en dispositivo real.
3. No existe Release `frontera-v0.1.2` en GitHub y el canal de main sigue anunciando 0.1.0 sin URL. Se generó un manifiesto candidato firmado **NO PUBLICADO**; jamás publicar una URL inexistente.
4. Próximas APK deben compilarse de las fuentes Godot, pasar `apksigner` y pruebas físicas, y conservar certificado. Los PCK son recursos descargables separados; nuevas APK son instalaciones completas con consentimiento de Android, no parches de bytes.
5. Para usar esta arquitectura en apps independientes, crear package/certificado/canal propios; una misma APK no se convierte automáticamente en otra aplicación nativa.

**Gate de publicación: pendiente Android físico + Release real + verificación de actualización 0.1.2 a 0.1.3 preservando datos.**
