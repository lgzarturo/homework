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

### API Entrega de Pizza

- Creación de usuarios (CRUD)
- Los usuarios podrán ingresar a la API mediante un token
- Cuando un usuario está autenticado, podrá descargar el menú y llenar un carrito de compras
- Los usuarios podrán crear ordenes de compra y realizar su pago con Stripe
- Se debe enviar notificaciones por correo mediante Mailgun

### Validación de la tarea 2

Sé valido el funcionamiento del API mediante Postman, los endpoints disponibles son:

- /ping: Probar que la aplicación este disponible.
- /hello: La ruta de la tarea 1.
- /pizza: El acceso a la creación del registro en el log.
- /api/users: CRUD Administración de usuarios.
- /api/tokens: Generación y administración de tokens.
- /api/checks: Registro de tareas para validar sitios web.
- /api/menu: Mostrar el menu de las pizzas.
- /api/shopping-cart: Agregar elementos al carrito de compras.
- /api/payments: Realizar el pago de servicios (**stripe, mailgun**).
- /api/sms': Enviar una notificación por SMS con **twilio**

> Nota: Todos los endpoints estas agregados en el archivo **http-endpoints.http** y los datos de prueba se pueden definir en **http-client.env.json**

### Pasos para probar el sistema

##### 1. Se pueden crear nuevos usuarios, se puede editar su información y se pueden eliminar. Debemos almacenar su nombre, dirección de correo electrónico y dirección postal.

- /api/users: El CRUD funciona correctamente para la administración de usuarios.

##### 2. Los usuarios pueden iniciar y cerrar sesión creando o destruyendo un token

- /api/tokens: Las rutas de esta API se verificaron para que se valide a los usuarios con el objetivo de obtener el token valido para realizar las operaciones en el sistema.

> El usuario de prueba **lgzarturo@gmail.com** tiene la contraseña **12345**

##### 3. Cuando un usuario inicia sesión, debería poder OBTENER todos los elementos posibles del menú (ver el ejemplo del archivo Menu.json)

- /api/menu: Se obtienen todos los items del menu guardado en el archivo .data/items/menu.json
- /api/menu?code=?: Con el parámetro code se obtiene el item deseado.

Example Menu.json

```json
{
  "1": {
	"code": "1",
	"name": "Pizza Personal",
	"price": 60.00
  },
  "2": {
	"code": "2",
	"name": "Pizza Mediana",
	"price": 110.00
  },
  "3": {
	"code": "3",
	"name": "Pizza Grande",
	"price": 150.00
  },
  "4": {
	"code": "4",
	"name": "Pizza Familiar",
	"price": 230.00
  }
}
```

##### 4. Un usuario que haya iniciado sesión debería poder llenar un carrito de compras con elementos de menú

- /api/shopping-cart: Con el método get se obtiene el listado de items del carrito de compras y con el método post se agregan elementos al carrito.

##### 5. Se puede realizar el pago mediante [Stripe.com](https://stripe.com/docs/testing#cards), una vez procesado el pago se envía una notificación al correo del usuario con [Mailgun.com](https://documentation.mailgun.com/en/latest/faqs.html#how-do-i-pick-a-domain-name-for-my-mailgun-account), usando solo nodejs.

- /api/payments: se agregan los datos de la tarjeta de crédito de pruebas
  `{ "creditCart": "4242424242424242", "validMonth": "12", "validYear": "2020", "codeCard": "716" }`
- /api/payments?order=?: se solicita el re-envío de la orden

##### 6. Se puede enviar un mensaje SMS con el monto total y el número de orden procesada, el correo del destinatario se debe especificar con el header phone

- /api/sms?order=?: se solicita el envío del un SMS
