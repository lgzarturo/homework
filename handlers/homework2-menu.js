/**
 * Homework 2 - Controlador del CRUD User
 */

// Dependencias de la aplicacion
var _data = require('./../lib/data');
var _helpers = require('./../lib/helpers');

// Controlador dependiendo la solicitud URI
var handlers = {};

// Manejo de los metodos que seran aceptados en el controlador.
handlers.items = function (data, callback) {
  var acceptableMethods = ['get'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._items[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._items = {};

// Items - get (URI: /items?code={code})
handlers._items.get = function (data, callback) {
  var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  var email = typeof(data.headers.email) == 'string' && data.headers.email.trim().length > 0 ? data.headers.email : false;
  var code = typeof(data.queryStringObject.code) == 'string' && data.queryStringObject.code.trim().length > 0 ? data.queryStringObject.code.trim() : false;
  _helpers.verifyToken(token, email, function (isValid) {
    if (isValid) {

      _data.read('items', 'menu', function (err, data) {
        if (!err && data) {
          if (code) {
            callback(200, data[code]);
          } else {
            callback(200, data);
          }
        } else {
          callback(400);
        }
      });    

    } else {
      callback(403, {'Error': 'El token es requerido o ya no es valido.'});
    }
  });
};

module.exports = handlers;