# Change Log

Proyecto Pizza Pirple.
Tareas de curso de Node JS

## [Unreleased]

### Added

- Se inclyen los arreglos en.js y es.js para aplicar las etiquetas de la i18n.
- Se actualiza la documentación del código.

## 19-06-2019

### Added

- Se incluye un método para aplicar i18n a las respuestas de las solicitudes.
- Se mejora el soporte de la documentación mediante Github Pages.
- Se realizan mejoras en la documentación, mediante anotaciones.

## 18-06-2019

### Added

- Se agregaron los centavos en las transacciones del Stripe.
- Se agrego el reenvió del comprobante de pago, mediante el número de orden.
- Se modificaron las definiciones de las variables [Airbnb JavaScript Style](https://github.com/airbnb/javascript).
- Se incluye la documentación de las funciones del código.
- Se cambiaron las respuestas de los codigos de la API, para que [cumplan con un estandar](https://www.restapitutorial.com/httpstatuscodes.html). 

## 17-06-2019

### Added

- Se valido el funcionamiento del API mediante Postman
- /hello: La ruta de la tarea 1.
- /pizza: El acceso a la creación del registro en el log.
- /users: El CRUD funciona correctamente para la administración de usuarios.
- /tokens: Las rutas de esta API se verificaron para que se valide a los usuarios con el objetivo de obtener el token valido para realizar las operaciones en el sistema.
- /menu: Se obtienen todos los items del menu guardado en el archivo .data/items/menu.json
- /menu?code=?: Con el parámetro code se obtiene el item deseado.
- /shopping-cart: Con el método get se obtien el listado de items del carrito de compras y con el método post se agregan elementos al carrito.
- /payments: se agregan los datos de la tarjeta de credito de pruebas
- /payments: al procesar el pago de la orden se envia un correo con la confirmación.
- /payments?order=?: se solicita el reenvio de la orden

### Changed

## OCT 2018

### Added

- Commits on Oct 15, 2018: Se integraron las API de Stripe y Mailgun
- Commits on Oct 11, 2018: Indentaciones
- Commits on Oct 9, 2018: logs, workers, data y handlers
- Commits on Oct 8, 2018: Se agregó la licencia MIT
- Commits on Oct 3, 2018: Homework #1
