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

### Validación de la tarea 2

Se valido el funcionamiento del API mediante Postman

- /hello: La ruta de la tarea 1.
- /pizza: El acceso a la creación del registro en el log.

#### Tareas

##### 1. New users can be created, their information can be edited, and they can be deleted. We should store their name, email address, and street address

- /users: El CRUD funciona correctamente para la administración de usuarios.

##### 2. Users can log in and log out by creating or destroying a token

- /tokens: Las rutas de esta API se verificaron para que se valide a los usuarios con el objetivo de obtener el token valido para realizar las operaciones en el sistema.

##### 3. When a user is logged in, they should be able to GET all the possible menu items (these items can be hardcoded into the system)

- /menu: Se obtienen todos los items del menu guardado en el archivo .data/items/menu.json
- /menu?code=?: Con el parámetro code se obtiene el item deseado.

##### 4. A logged-in user should be able to fill a shopping cart with menu items

- /shopping-cart: Con el método get se obtien el listado de items del carrito de compras y con el método post se agregan elementos al carrito.

##### 5. A logged-in user should be able to create an order. You should integrate with the Sandbox of Stripe.com to accept their payment. Note: Use the stripe sandbox for your testing. Follow this link and click on the "tokens" tab to see the fake tokens you can use server-side to confirm the integration is working: [Stripe.com](https://stripe.com/docs/testing#cards)

- /payments: se agregan los datos de la tarjeta de credito de pruebas
`
{
    "creditCart": "4242424242424242",
    "validMonth": "12",
    "validYear": "2020",
    "codeCard": "716"
}
`

##### 6. When an order is placed, you should email the user a receipt. You should integrate with the sandbox of Mailgun.com for this. Note: Every Mailgun account comes with a sandbox email account domain (whatever@sandbox123.mailgun.org) that you can send from by default. So, there's no need to setup any DNS for your domain for this task [Mailgun.com](https://documentation.mailgun.com/en/latest/faqs.html#how-do-i-pick-a-domain-name-for-my-mailgun-account)

- /payments: al procesar el pago de la orden se envia un correo con la confirmación.
- /payments?order=?: se solicita el reenvio de la orden
