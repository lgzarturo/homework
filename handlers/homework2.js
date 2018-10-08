/**
 * Homework 2
 */

// Controlador dependiendo la solicitud URI
var handlers = {};

// URI /pizza 
handlers.pizza = function (data, callback) { 
	data = {'Success': 'Modulo - Pizza Delivery', 'Data': 'Homework #2'};
	callback(200, data);
};

module.exports = handlers;