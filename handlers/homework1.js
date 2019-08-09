/**
 * Homework 1
 * Crear una API Simple para mostrar un mensaje
 */

// Dependencias libs
let _workers = require('./../lib/workers');
// @ignore
let _helpers = require('./../lib/helpers');

// Controlador dependiendo la solicitud URI
let handlers = {};
// @ignore
let logFileName = 'homework1';

/**
 * URI /ping - Sirve para verificar si el servidor esta vivo.
 * @param data
 * @param callback
 */
handlers.ping = function (data, callback) {
    callback(200, {'success': _helpers.translate('success.ping', data.lang)});
};

/**
 * URI /hello - Solo muestra un mensaje de bienvenida.
 * @param data
 * @param callback - code: 200
 */
handlers.hello = function (data, callback) {
    data = {
        'success': _helpers.translate('success.hello.world.pizza', data.headers['accept-language']),
        'data': _helpers.translate('homework.one', data.headers['accept-language'])
    };
    _workers.log(logFileName, data, 200, '/hello');
    callback(200, data);
};

/**
 * URI por default - Si no cumple con ninguna ruta se devuelve un error 404
 * @param data
 * @param callback 404
 */
handlers.notFound = function (data, callback) {
    data = {
        'error': _helpers.translate('resource.not.found', data.headers['accept-language'])
    };
    _workers.log(logFileName, data, 404, 'notFound');
    callback(404, data);
};

// @ignore
module.exports = handlers;
