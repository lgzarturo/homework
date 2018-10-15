# Homeworks sobre MasterClass NodeJS

## Homework 1

Paso 1 : Se cargan las dependencias (http y url)
Paro 2 : Se instancia el servidor HTTP y se inician los eventos 'data' y 'end' para procesar la solicitud.

- Escucha activa del servidor en el puerto 3000
- Se define el controlador dependiendo la solicitud URI
- Se establece un Objeto con las rutas disponibles

Paso 3 : Se determina cual es la ruta a procesar
Paso 4 : Se ejecuta el controlador adecuado dependiendo la petición (uri)
Paso 5 : Se retorna el objeto en String JSON y el código correspondiente.

## Homework 2

API Entrega de Pizza

- Creación de usuarios (CRUD)
- Los usuario podrán ingresar a la API mediante un token
- Cuando un usuario esta logeado, podrá descargar el menú y llenar un carrito de compras
- Los usuarios podrán crear ordenes de compra y realizar su pago con Stripe
- Se debe enviar notificaciones por correo mediante Mailgun