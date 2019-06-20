/**
 * Homework 2
 * Crear una API para la entrega de pizzas
 */

// Dependencias libs
let _workers = require('./../lib/workers');
// @ignore
let _helpers = require('./../lib/helpers');

// Controlador dependiendo la solicitud URI
let handlers = {};
// @ignore
let logFileName = 'homework2';

/**
 * URI /pizza
 * @param data
 * @param callback
 */
handlers.pizza = function (data, callback) {
    data = {
        'success': _helpers.translate('success.pizza.response', data.headers['accept-language']),
        'data': _helpers.translate('homework.two', data.headers['accept-language']),
    };
    _workers.log(logFileName, data, 200, '/pizza');
    callback(200, data);
};

// @ignore
module.exports = handlers;
