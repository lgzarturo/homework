/**
 * Homework 1
 */

// Dependencias de la aplicación
var _workers = require('./../lib/workers');

// Controlador dependiendo la solicitud URI
var handlers = {};
var logFileName = 'homework1';

// URI /hello 
handlers.hello = function (data, callback) { 
  data = {'Success': 'Entrega de Pizza "Hola Mundo"', 'Data': 'Homework #1'};
  _workers.log(logFileName, data, 200, '/hello');
  callback(200, data);
};

// URI por default - Si no cumple con ninguna ruta se devuelve un error 404
handlers.notFound = function (data, callback) {
  data = {'Error': 'Ruta invalida'};
  _workers.log(logFileName, data, 404, 'notFound');
  callback(404, data);
};

module.exports = handlers;