# Base de datos

Esta aplicacion ya NO usa Supabase. Todo (usuarios, obras, inventario,
cotizaciones y chat) vive en MongoDB Atlas.

No hay ningun script SQL que correr ni tablas que crear a mano: Mongoose
crea las colecciones automaticamente la primera vez que el backend guarda
un dato. Vea `backend/models/*.js` para el detalle de cada coleccion.

Si tenia un proyecto de Supabase de una version anterior de esta app, ya
no lo necesita y puede eliminarlo desde el dashboard de Supabase cuando
quiera.
