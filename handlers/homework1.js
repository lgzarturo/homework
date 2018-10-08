/**
 * Homework 1
 */

// Controlador dependiendo la solicitud URI
var handlers = {};

// URI /hello 
handlers.hello = function (data, callback) { 
	data = {'Success': 'Entrega de Pizza "Hola Mundo"', 'Data': 'Homework #1'};
	callback(200, data);
};

// URI por default - Si no cumple con ninguna ruta se devuelve un error 404
handlers.notFound = function (data, callback) {
	data = {'Error': 'Ruta invalida'};
	callback(404, data);
};

module.exports = handlers;