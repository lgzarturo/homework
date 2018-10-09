/**
 * Homework 2 - Controlador del CRUD Token
 */

// Controlador dependiendo la solicitud URI
var handlers = {};

// Manejo de los metodos que seran aceptados en el controlador.
handlers.tokens = function (data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._tokens = {};

// Tokens - post (URI: /users)
// Parametros:
handlers._tokens.post = function (data, callback) {  };

// Tokens - get (URI: /users/{id})
handlers._tokens.get = function (data, callback) {  };

// Tokens - put (URI: /users)
handlers._tokens.put = function (data, callback) {  };

// Tokens - delete (URI: /users/{id})
handlers._tokens.delete = function (data, callback) {  };

module.exports = handlers;