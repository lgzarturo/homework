/**
 * Homework 2
 * Crear una API para la entrega de pizzas
 */

// Dependencias libs
const workers = require('./../lib/workers');
// @ignore
const helpers = require('./../lib/helpers');
// Controlador dependiendo la solicitud URI
const handlers = {};
// @ignore
const logFileName = 'homework2';

/**
 * URI /pizza
 * @param data
 * @param callback
 */
handlers.pizza = function(data, callback) {
  const requestData = {
    success: helpers.translate('success.pizza.response', data.headers['accept-language']),
    data: helpers.translate('homework.two', data.headers['accept-language'])
  };
  workers.log(logFileName, requestData, 200, '/pizza');
  callback(200, requestData);
};

// @ignore
module.exports = handlers;
