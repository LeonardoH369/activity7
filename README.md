# activity-9

Sistema MVC de autenticación para Activity 9 de Diseño de Aplicaciones Web. Se implementa con Node.js, Express, Sequelize, EJS y MySQL/MariaDB, conservando el stack elegido para las entregas anteriores en lugar de Laravel 7.

## Funciones

- `/` redirige al dashboard si existe una sesión autenticada; en otro caso muestra `landingpage`.
- `/landingpage`: vista pública, diferenciada visualmente del panel privado.
- `/register`: registro con nombre, correo único y contraseña confirmada de 12–128 caracteres.
- `/login`: autenticación con mensajes genéricos ante credenciales incorrectas.
- `/dashboard`: vista privada protegida en el servidor; los visitantes se redirigen a login.
- `POST /logout`: destruye la sesión. La navbar cambia según el estado de autenticación.

## Instalación (PowerShell)

Requiere Node.js 22.13+ y MySQL/MariaDB activo. No necesita PHP.

```powershell
npm ci
Copy-Item .env.example .env
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Edita `.env`: configura DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASSWORD. Copia el valor aleatorio generado a SESSION_SECRET. Usa una cuenta MySQL local propia; no publiques `.env`.

```powershell
npm run db:create
npm run db:migrate
npm start
```

Abrir http://localhost:3009. En el entorno de desarrollo de esta entrega se usa MySQL/MariaDB local en el puerto 3307; el ejemplo usa 3306 para una instalación común.

## Arquitectura y seguridad

`src/controllers/AuthController.js` procesa registro, login y logout. `src/models/index.js` define User; `src/migrations` crea usuarios y sesiones persistidas en MySQL. Las vistas están en `src/views`.

Las contraseñas se guardan con scrypt (N=32768, r=8, p=3) y sal aleatoria individual, nunca en texto plano. Se regenera el identificador de sesión al autenticar. Cookies HttpOnly, SameSite=Lax, caducidad deslizante de una hora y Secure en producción. Los formularios POST requieren un token CSRF de sesión. Helmet agrega cabeceras; EJS escapa los datos; se valida la entrada y se limitan intentos por IP (20/15 minutos).

El limitador en memoria es apropiado para esta instancia académica; un despliegue con varias instancias requiere un almacén compartido. El servidor escucha solo en localhost. Para producción configura HTTPS, proxy de confianza explícito si aplica y gestión de secretos antes de exponerlo. Esta entrega no incluye recuperación de contraseña ni verificación de propiedad del correo.

## Pruebas

Las pruebas se ejecutan exclusivamente contra `activity_9_test`; borran sus usuarios de prueba. Nunca se debe usar esa base para datos importantes.

```powershell
$env:NODE_ENV='test'
npm run db:create
npm run db:migrate
npm test
Remove-Item Env:NODE_ENV
```

Verifican acceso de visitantes, formularios, validaciones, CSRF, hash, sesión, escape HTML, login incorrecto/correcto, duplicados, logout y limitación de intentos.

## Evidencias y GitHub

Proyecto preparado para `LeonardoH369/activity-9`. La creación del repositorio remoto y el push deben confirmarse antes de entregar; una dirección prevista no demuestra que el código esté publicado.

Capturas requeridas: landingpage; registro; login; dashboard con navbar autenticada; intento de visitar `/dashboard` en ventana privada que redirige a login. Usar una cuenta de prueba y ocultar datos personales.

## Referencias

- https://expressjs.com/en/advanced/best-practice-security.html
- https://expressjs.com/en/resources/middleware/session.html
- https://sequelize.org/docs/v6/

## Homework 8: correos

El registro genera una bienvenida; cada login correcto posterior genera una alerta. El destinatario es el correo guardado en MySQL. Un login incorrecto no genera mensajes. Nodemailer crea versiones HTML/texto; `mail_events` conserva estados e intentos. Un fallo SMTP permite continuar al usuario y conserva el envío para reintento. No se guardan errores del proveedor que puedan incluir datos sensibles.

### Prueba local y entrega real

La configuración actual `MAIL_MODE=preview` genera archivos locales en `var/mail-preview`, excluidos de Git. **No envía correos a Internet** y nunca marca esas vistas previas como `sent`.

Para un SMTP real, configura `.env` con tus propios valores. No publiques credenciales ni las pegues en el chat. Ejemplo Gmail (contraseña de aplicación, si tu cuenta lo permite):

```dotenv
MAIL_MODE=smtp
MAIL_FROM="Activity 9 <TU_CORREO>"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=TU_CORREO
SMTP_PASSWORD=TU_CONTRASENA_DE_APLICACION
```

Para puerto 587, usa `SMTP_SECURE=false`: se exige STARTTLS. La validación de certificados permanece activa.

```powershell
npm run mail:verify
npm start
```

`mail:verify` comprueba conexión y autenticación, no recepción en la bandeja de entrada. Registra una cuenta con un buzón que controles y comprueba la bienvenida; cierra sesión y vuelve a entrar para comprobar la alerta. Revisa spam. `sent` significa aceptado por el servidor SMTP, no garantiza entrega al buzón.

`npm run mail:retry` procesa hasta 100 eventos pendientes/fallidos, con máximo 5 intentos por evento. Recupera eventos interrumpidos tras 5 minutos. Los eventos `preview` no se reenvían automáticamente al cambiar a SMTP: crea un registro nuevo y un login nuevo para las evidencias. Un corte entre aceptación SMTP y actualización de la base puede producir un duplicado; no se garantiza entrega exactamente una vez.

### Entrega pendiente

Falta configurar SMTP propio, comprobar recepción real, agregar capturas y publicar en GitHub. Captura bienvenida y alerta ocultando direcciones completas y datos sensibles, sin ocultar asunto, contenido y fecha. Nunca publiques `.env`, `var`, hashes o volcados de usuarios.

Reportes editables en preparación:

- Activity 9: https://docs.google.com/document/d/16GQZ2LS82cvWQdguF4cZlId0mvRPhRzEwP0x883RtPY/edit
- Homework 8: https://docs.google.com/document/d/1vfQRZ45jT5ofJBkSpWlCgMdWnR24WsT4e4qx_WH6gMM/edit

El tag `activity-9` conserva autenticación y `homework-8` incorpora notificaciones. Las pruebas de correo utilizan un servidor SMTP local, no un buzón real. Ninguna de estas consignas exige un archivo SQL.

Referencias: https://nodemailer.com/smtp y https://nodemailer.com/guides/using-gmail
