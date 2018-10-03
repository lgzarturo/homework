# Homework 1

Paso 1 : Se cargan las dependencias (http y url)

Paro 2 : Se instancia el servidor HTTP y se inician los eventos 'data' y 'end' para procesar la solicitud.

- Escucha activa del servidor en el puerto 3000
- Se define el controlador dependiendo la solicitud URI
- Se establece un Objeto con las rutas disponibles

Paso 3 : Se determina cual es la ruta a procesar

Paso 4 : Se ejecuta el controlador adecuado dependiendo la petición (uri)

Paso 5 : Se retorna el objeto en String JSON y el código correspondiente.
