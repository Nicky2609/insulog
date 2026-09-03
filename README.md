# Insulog S.A.S. - Plataforma web

Aplicacion web para Insulog S.A.S. (construccion, logistica y suministros).

Incluye:
- Sitio publico con informacion de la empresa
- Control de inventario con descarga y carga de Excel, foto por item
- Cotizaciones por chat estilo WhatsApp (texto, fotos, notas de voz) y por formulario directo
- Control de obras
- Roles: administrador, ingeniero y cotizante
- Login propio (sin servicios externos): usuarios y contraseñas viven en MongoDB

## Arquitectura

Todo vive en **MongoDB Atlas**: usuarios (con su contraseña encriptada),
obras, inventario, cotizaciones y chat. No se usa ningun servicio externo
de autenticacion.

El login funciona asi:
1. El usuario ingresa correo y contraseña.
2. El backend busca el usuario en MongoDB y compara la contraseña
   (encriptada con bcrypt, nunca se guarda en texto plano).
3. Si es correcta, el backend genera un "token" (JWT) y se lo entrega al
   navegador.
4. El navegador guarda ese token y lo envia en cada peticion siguiente,
   como si fuera un pase de acceso temporal (dura 30 dias).

Las fotos del chat y del inventario se guardan directamente en el
servidor del backend, en la carpeta `backend/uploads/`, y se sirven desde
ahi mismo.

```
insulog/
  backend/     API en Node.js + Express + MongoDB (login propio con JWT)
  frontend/    Aplicacion en React + Vite + Tailwind
  database/    Nota: ya no hay scripts SQL, todo es MongoDB
```

## Roles del sistema

| Rol       | Puede hacer |
|-----------|-------------|
| admin     | Todo: inventario, obras, cotizaciones, gestionar usuarios y roles |
| engineer  | Inventario, obras, responder cotizaciones (chat y formulario) |
| quoter    | Solo puede acceder al chat de su propia cotizacion. Si no inicia sesion, unicamente puede llenar el formulario publico de contacto |

## 1. Configurar MongoDB Atlas

1. Entre a [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) y cree
   una cuenta gratuita.
2. Cree un **cluster gratuito (M0)**.
3. En **Database Access**, cree un usuario de base de datos con contraseña
   (use "Autogenerate Secure Password" para evitar problemas con caracteres
   especiales).
4. En **Network Access**, agregue `0.0.0.0/0` para desarrollo (permite
   conectarse desde cualquier IP; en produccion, restrinjalo a la IP de su
   servidor).
5. En **Database > Connect > Drivers**, copie el connection string y
   reemplace `<password>` por su contraseña real. Agregue el nombre de la
   base de datos (`insulog`) antes del `?`:
   ```
   mongodb+srv://usuario:contraseña@cluster0.xxxxx.mongodb.net/insulog?retryWrites=true&w=majority
   ```

No necesita crear colecciones a mano: se crean solas la primera vez que
el backend guarda un dato.

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Complete el `.env`:
```
PORT=4000
PUBLIC_URL=http://localhost:4000
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster0.xxxxx.mongodb.net/insulog?retryWrites=true&w=majority
JWT_SECRET=escriba-aqui-un-texto-largo-y-aleatorio-que-solo-usted-conozca
CORS_ORIGIN=http://localhost:5173
```

`JWT_SECRET` puede ser cualquier texto largo y dificil de adivinar (por
ejemplo, generelo con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
Es lo que hace que nadie pueda falsificar un token de sesion sin conocerlo.

```bash
npm run dev
```

Debe salir `Connected to MongoDB` y luego `Insulog backend listening on port 4000`.
Verifique con `GET http://localhost:4000/api/health`.

## 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

El `.env` del frontend ahora solo necesita:
```
VITE_API_URL=http://localhost:4000/api
```

```bash
npm run dev
```

## 4. Crear su primer usuario administrador

1. En la web, vaya a **Registro** (`/registro`) y cree una cuenta con su
   correo. Esa cuenta se crea automaticamente como `quoter` (cotizante).
2. Convierta esa cuenta en administrador conectandose directamente a su
   base de datos (opcion mas simple: MongoDB Atlas -> su cluster ->
   **Browse collections** -> base de datos `insulog` -> coleccion `users`
   -> busque su documento por `email` -> edite el campo `role` de
   `"quoter"` a `"admin"` -> Update).
3. Cierre sesion y vuelva a entrar. Ahora vera el panel completo.

Alternativa: una vez tenga un usuario `admin`, puede crear el resto de
cuentas de staff (ingenieros, otros admins) directamente desde el panel
**Usuarios**, sin tocar la base de datos.

## 5. Uso del inventario en Excel

- **Descargar Excel**: genera un `.xlsx` con todo el inventario actual.
- **Subir Excel**: actualiza items existentes (por Codigo) y crea los que
  no existan. Filas sin Codigo o Nombre se omiten y se informan en el
  resultado.
- Cada item puede tener una foto, guardada en `backend/uploads/inventory/`.

## 6. Cotizaciones: chat vs formulario

- **Chat** (`/cotizar/chat`): requiere cuenta de cotizante. Los archivos
  adjuntos (fotos, notas de voz) se guardan en `backend/uploads/chat/`.
- **Formulario** (`/cotizar/formulario`): no requiere cuenta.

## 7. Despliegue sugerido

- **Backend**: cualquier host de Node.js (Railway, Render, Pterodactyl con
  soporte Node). Configure las variables de entorno del `.env`, y
  **cambie `PUBLIC_URL`** por el dominio real donde quede el backend
  (por ejemplo `https://api.insulog.com`), para que las fotos se vean
  bien fuera de su computador.
- **Frontend**: build estatico con `npm run build` (genera `frontend/dist`).
- **MongoDB**: Atlas ya es un servicio administrado en la nube.
- **Archivos subidos**: viven en el disco del servidor del backend
  (`backend/uploads/`). Si despliega en un servicio que borra el disco
  entre despliegues (como algunos planes gratuitos), las fotos antiguas
  se perderian; para producción real conviene un volumen persistente o,
  mas adelante, migrar a un servicio de almacenamiento como S3.

## 8. Notas tecnicas

- Las contraseñas nunca se guardan en texto plano: se encriptan con
  bcrypt antes de guardarse en MongoDB.
- La sesion se maneja con JWT: un token firmado con `JWT_SECRET` que el
  navegador guarda en `localStorage` y envia en cada peticion. Dura 30
  dias; despues de eso, el usuario debe volver a iniciar sesion.
- La seguridad de cada ruta se aplica en el backend con `requireAuth` +
  `requireRole`, incluyendo la verificacion de que un cotizante solo
  pueda ver su propia conversacion de chat.
- El chat usa "polling" cada 4-6 segundos en vez de websockets.
