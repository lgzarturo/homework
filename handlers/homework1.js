/**
 * Homework 1
 * Crear una API Simple para mostrar un mensaje
 */

// Dependencias de la aplicación
let _workers = require('./../lib/workers');

// Controlador dependiendo la solicitud URI
let handlers = {};
let logFileName = 'homework1';

/**
 * URI /hello - Solo muestra un mensaje de bienvenida.
 * @param data
 * @param callback - code: 200
 */
handlers.hello = function (data, callback) {
    data = {'Success': 'Entrega de Pizza "Hola Mundo"', 'Data': 'Homework #1'};
    _workers.log(logFileName, data, 200, '/hello');
    callback(200, data);
};

/**
 * URI por default - Si no cumple con ninguna ruta se devuelve un error 404
 * @param data
 * @param callback 404
 */
handlers.notFound = function (data, callback) {
    data = {'Error': 'Ruta invalida, el recurso solicitado no existe'};
    _workers.log(logFileName, data, 404, 'notFound');
    callback(404, data);
};

module.exports = handlers;
