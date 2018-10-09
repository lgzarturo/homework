/**
 * Homework 2
 */

// Dependencias de la aplicación
var _workers = require('./../lib/workers');

// Controlador dependiendo la solicitud URI
var handlers = {};
var logFileName = 'homework2';

// URI /pizza 
handlers.pizza = function (data, callback) { 
  data = {'Success': 'Modulo - Pizza Delivery', 'Data': 'Homework #2'};
  _workers.log(logFileName, data, 200, '/pizza');
  callback(200, data);
};

module.exports = handlers;