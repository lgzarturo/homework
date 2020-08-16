/**
 * Homework 2
 * Crear una API para la entrega de pizzas
 */

// Dependencias libs
const workers = require('../lib/workers')
const helpers = require('../lib/helpers')
// Controlador dependiendo la solicitud URI
const handlers = {}

const logFileName = 'homework2'

/**
 * URI /pizza
 * @param req
 * @param callback
 */
handlers.pizza = (req, callback) => {
  const requestData = {
    success: helpers.translate('success.pizza.response', req.lang),
    data: helpers.translate('homework.two', req.lang),
  }
  workers.log(logFileName, requestData, 200, '/pizza')
  callback(200, requestData)
}

module.exports = handlers
