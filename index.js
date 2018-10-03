/**
 * Homework 1
 */

// Dependencias
var url = require('url');
var http = require('http');

//Instancia del servidor HTTP
var httpServer = http.createServer(function (req, res) {
  var paserUrl = url.parse(req.url, true);

  req.on('data', function () {});

  req.on('end', function () {
    // Obtener la ruta a procesar
    var uri = paserUrl.pathname.replace(/^\/+|\/+$/g, '');
    var chooseHandler = typeof(router[uri]) != 'undefined' ? router[uri] : handlers.notFound;
    
    // Ejecutar el controlador adecuado dependiendo la peticion (uri)
    chooseHandler({}, function (statusCode, payload) {
      // Se retorna el objeto en String JSON y el codigo correspondiente
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(typeof(statusCode) == 'number' ? statusCode : 200);
      res.end(JSON.stringify(typeof(payload) == 'object' ? payload : {}));
    });

  });

});

// Escucha activa del servidor en el puerto 3000
httpServer.listen(3000, function() {
  console.log('Servidor inicializado');
});

// Controlador dependiendo la solicitud URI
var handlers = {};

// URI /hello 
handlers.hello = function (data, callback) { 
  data = {'Success': 'Hola mundo'};
  callback(200, data);
};

// URI por default - Si no cumple con ninguna ruta se devuelve un error 404
handlers.notFound = function (data, callback) {
  data = {'Error': 'Ruta invalida'};
  callback(404, data);
};

// Objeto con las rutas disponibles
var router = {
  'hello' : handlers.hello,
};
