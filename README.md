# Más Network 92.1 FM

Aplicación web instalable de la radio del Medio Palo, desde Ciudad Bolívar, Venezuela. Incluye radio en vivo, programación, pedidos por WhatsApp, redes sociales, carruseles multimedia y administración por PIN.

Se construyó con React, TypeScript, TanStack Start, Vite, Netlify Functions, Netlify Database con Drizzle y Netlify Blobs para archivos. Los logos e imágenes pertenecen al material suministrado por la emisora. Las imágenes estáticas se sirven mediante Netlify Image CDN.

## Desarrollo local

Requiere Node 22.13+ y pnpm. Instala las dependencias con `pnpm install` y ejecuta `netlify dev --port 8889` desde un proyecto vinculado a Netlify. Esto incluye las funciones y la integración de almacenamiento. La conexión a la base de datos se configura mediante Netlify; no se deben incluir credenciales en el código.

El esquema está en `db/schema.ts`. Los cambios de esquema requieren una migración con `pnpm exec drizzle-kit generate --name descripcion_del_cambio`. Netlify aplica las migraciones en el despliegue.

## Uso y administración

Presiona «Escuchar en vivo» para iniciar la señal. La reproducción comienza después de una acción del oyente, conforme a las políticas del navegador. El reproductor permanece disponible al recorrer la página.

Abre «Administración» al final de la página o mantén pulsado el logo del encabezado durante tres segundos. Introduce el PIN acordado con la emisora. Los cambios del panel son borradores hasta pulsar «Guardar cambios». Los oyentes reciben los cambios publicados en el siguiente ciclo de sincronización, de hasta 15 segundos. La sincronización se pausa mientras se edita y cuando la página está en segundo plano.

El panel permite gestionar identidad, audio directo HTTPS, imágenes, textos, programación, redes, contacto, colores, tipografías, orden y visibilidad de secciones, modo cine, 59 efectos y 30 funciones. La programación ofrece ocho estilos y cinco formatos horarios. El programa actual y el siguiente se calculan en la zona horaria de Caracas, incluyendo el siguiente día con programación. Los favoritos y recordatorios son para la sesión actual, sin registro de oyentes.

Los archivos del carrusel aceptan imágenes PNG/JPEG/WebP/GIF y videos MP4/WebM de hasta 4,5 MB por archivo. Los videos mayores pueden agregarse mediante una URL HTTPS directa. Los videos incluyen controles; al reproducir un video se pausa la radio. Puedes cambiar de diapositiva con las flechas o indicadores.

Se interpretó «11:00 PM a 1:00 PM» de Conexión 0285 como 11:00 AM a 1:00 PM para respetar la secuencia diurna. El horario se puede editar en el panel.

## Instalación

«Instalar app» presenta el diálogo del navegador cuando está disponible y una guía por plataforma. En Android usa Chrome e «Instalar aplicación». En iPhone/iPad usa Safari, Compartir y «Añadir a pantalla de inicio». En computadora usa la opción de instalación de Chrome o Edge.

Esta entrega es una PWA: se instala desde la web; no contiene paquetes APK/IPA ni publicaciones en App Store o Google Play. La reproducción en segundo plano, el volumen desde JavaScript y las funciones de vibración dependen del navegador y del sistema operativo. El audio necesita internet. El service worker proporciona una pantalla de desconexión y guarda recursos estáticos, nunca audio, sesiones ni respuestas de administración.

## Seguridad y operación

El PIN se verifica exclusivamente en el servidor mediante una huella scrypt. Las sesiones aleatorias se guardan como huellas en la base de datos, usan cookies HttpOnly/Secure/SameSite y vencen después de ocho horas. Las escrituras validan el origen y la sesión; los datos se validan con Zod. Los intentos fallidos están limitados por dirección de red. No se debe colocar el PIN ni credenciales en archivos públicos o documentación.

La URL suministrada era una página del proveedor. Se utilizó su configuración pública para obtener la señal directa. Una sonda comprueba la señal cada 45 segundos en primer plano; ante un resultado indeterminado se conservan los eventos del reproductor como referencia. El administrador puede reemplazar la URL. El contenido se conserva en Netlify Database y los archivos cargados en Netlify Blobs.

La revisión de esta entrega se realizó leyendo los archivos. No se ejecutaron servidores, compilaciones ni pruebas locales; el entorno de despliegue realiza la validación de construcción.
