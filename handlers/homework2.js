/**
 * Homework 2
 * Crear una API para la entrega de pizzas
 */

// Dependencias de la aplicación
let _workers = require('./../lib/workers');

// Controlador dependiendo la solicitud URI
let handlers = {};
let logFileName = 'homework2';

/**
 * URI /pizza
 * @param data
 * @param callback
 */
handlers.pizza = function (data, callback) {
    data = {'Success': 'Modulo - Pizza Delivery', 'Data': 'Homework #2'};
    _workers.log(logFileName, data, 200, '/pizza');
    callback(200, data);
};

module.exports = handlers;
