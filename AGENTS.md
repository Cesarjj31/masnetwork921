# Más Network 92.1 FM — arquitectura

Aplicación de radio en español, responsive e instalable como PWA. Usa TanStack Start/React y Netlify. La identidad visual combina azul profundo, amarillo y los logos originales. Outfit es la fuente de lectura y Barlow Condensed la fuente de portada.

## Directorios

- `src/routes/index.tsx`: página, reproductor persistente, estados de señal, programación, sincronización, instalación y modo cine.
- `src/components/admin-panel.tsx`: editor de configuración, programación, textos, medios y apariencia. Los borradores se publican explícitamente con Guardar cambios.
- `src/components/social-icon.tsx`: iconos SVG de ocho redes; no usar emojis o imágenes remotas como sustitutos.
- `src/lib/station.ts`: tipos, configuración inicial, programación entregada y utilidades de hora de Caracas e imágenes.
- `src/lib/effects.ts`: registro de 59 efectos (34 visuales, 11 de interacción, 8 de notificación y 6 de distribución). Sus clases y comportamientos están conectados a la UI.
- `src/styles.css`: tokens, diseño y estilos adaptables, presentaciones de programación, efectos y reducción de movimiento.
- `db/schema.ts`, `db/index.ts`: esquema y fábrica de cliente Drizzle usando el adaptador de Netlify Database.
- `netlify/database/migrations`: migraciones aplicadas por Netlify. No editar migraciones ya desplegadas.
- `netlify/functions`: endpoints de lectura/publicación de configuración, acceso PIN, medios, manifest dinámico y sonda de señal.
- `netlify/lib`: auxiliares privados de autenticación. Nunca importar estos módulos desde componentes del cliente.
- `public/img`: material de la emisora e iconos de instalación.
- `public/sw.js`, `public/offline.html`: caché de recursos estáticos y pantalla de desconexión.

## Persistencia y autenticación

Toda la configuración publicada, incluida la programación y el orden del carrusel, se guarda en `app_config` de Netlify Database. Las sesiones y los intentos de acceso también usan tablas Postgres. Los archivos binarios se guardan en Netlify Blobs. No sustituir estas plataformas por JSON local, localStorage o una base de datos externa.

La lectura pública usa ETag y consulta cada 15 segundos mientras la página está visible y el panel cerrado. Los borradores no se sobrescriben con consultas remotas. Las escrituras requieren sesión válida, origen del mismo sitio y validación Zod. Las sesiones duran ocho horas. La autenticación por PIN fue solicitada expresamente; no añadir registro ni una autorización externa al flujo. No imprimir ni documentar el PIN, los secretos o las huellas de credenciales.

La sonda de audio usa GET con Range, cancela el cuerpo tras recibir encabezados y tiene tiempo máximo. Rechaza redes privadas y redirecciones. Una sonda indeterminada no basta para declarar la radio caída. El audio mantiene sus propios estados de carga y error.

## Convenciones

Usar TypeScript, componentes React funcionales y SVG para iconos. Mantener accesibles botones, campos y diálogos, preservar foco visible y respetar movimiento reducido. Las APIs residen en funciones `.mts`; los auxiliares viven fuera del directorio de funciones. Las variables de entorno, si fueran necesarias, se leen con `Netlify.env.get` dentro de las funciones.

Agregar nuevos campos tanto a los valores iniciales como al validador del endpoint y al editor. Actualizar el esquema exige generar una migración con drizzle-kit. Drizzle y drizzle-kit deben permanecer en la línea `@beta` que incluye el adaptador `netlify-db`.

El manifiesto se genera en `/manifest.webmanifest` desde la configuración publicada para reflejar nombre, logo y colores. Los navegadores controlan cuándo actualizan una instalación existente. La aplicación es web instalable; no afirmar que se publicaron aplicaciones nativas en tiendas. Favoritos y recordatorios son de la sesión actual. Los avisos son dentro de la aplicación, no notificaciones push del sistema.

La programación inicial interpreta Conexión 0285 como 11:00 AM–1:00 PM. Los programas no cruzan medianoche: dividir un programa nocturno en bloques o ampliar el modelo antes de permitirlo. La biblioteca de carga acepta archivos de hasta 4,5 MB para respetar los límites de las funciones; para videos mayores se ofrece URL directa.

## Trabajo local

Usar `pnpm install` y, cuando esté autorizado, `netlify dev --port 8889`. Respetar las restricciones del entorno de cada sesión: en la creación inicial se prohibieron pruebas, compilaciones y servidores locales; se revisaron los archivos y se dejó la validación al pipeline. No ejecutar comandos de validación si las instrucciones de la sesión los prohíben.
