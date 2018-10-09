/**
 * Homework 2 - Controlador del CRUD User
 */

// Controlador dependiendo la solicitud URI
var handlers = {};

// Manejo de los metodos que seran aceptados en el controlador.
handlers.users = function (data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._users = {};

// Users - post (URI: /users)
// Parametros: name, email address, password, and street address
handlers._users.post = function (data, callback) {
  var name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;  
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;	
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var streetAddress = typeof(data.payload.streetAddress) == 'string' ? data.payload.streetAddress.trim() : false;

  if (name && email && password && streetAddress) {
    console.log('request');
  }
	
};

// Users - get (URI: /users/{id})
handlers._users.get = function (data, callback) {  };

// Users - put (URI: /users)
handlers._users.put = function (data, callback) {  };

// Users - delete (URI: /users/{id})
handlers._users.delete = function (data, callback) {  };

module.exports = handlers;