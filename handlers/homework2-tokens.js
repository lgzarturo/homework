/**
 * Homework 2 - Controlador del CRUD Token
 */

// Dependencias de la aplicación
var _config = require('./../config/config');
var _data = require('./../lib/data');
var _helpers = require('./../lib/helpers');

// Controlador dependiendo la solicitud URI
var handlers = {};

// Manejo de los metodos que seran aceptados en el controlador.
handlers.tokens = function (data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._tokens = {};

// Tokens - post (URI: /tokens)
// Parametros:
handlers._tokens.post = function (data, callback) {
  var email = typeof(data.payload.email) == 'string' ? data.payload.email.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  if (email && password) {
    _data.read('users', email, function (err, user) {
      if (!err && user) {
        var hashedPassword = _helpers.hash(password);
        if (hashedPassword == user.password) {
          var token = _helpers.createRandomString(_config.tokenSize);
          var expires = Date.now() + _config.tokenDuration;
          var object = {
            'email' : email,
            'token' : token,
            'expires' : expires
          };

          _data.create('tokens', token, object, function (err) {
            if (!err) {
              callback(200, object);
            } else {
              callback(500, {'Error': 'No se pudo generar un token valido'});
            }
          });
        } else {
          callback(500, {'Error': 'No se pudo verificar la validez del password.'});
        }
      } else {
        callback(500, {'Error': 'No se encontro el usuario seleccionado.'});
      }
    });
  } else {
    callback(500, {'Error': 'Faltan parametros para continuar con la solicitud.'});
  }
};

// Tokens - get (URI: /tokens?token={token})
handlers._tokens.get = function (data, callback) {
  var token = typeof(data.queryStringObject.token) == 'string' && data.queryStringObject.token.trim().length == _config.tokenSize ? data.queryStringObject.token.trim() : false; 
  if (token) {
    _data.read('tokens', token, function (err, data) {
      if (!err && data) {
        callback(200, data);
      } else {
        callback(404);
      }
    });
  } else{
    callback(400, {'Error': 'No se puede validar la solicitud.'});
  }
};

// Tokens - put (URI: /tokens)
handlers._tokens.put = function (data, callback) {
  var token = typeof(data.payload.token) == 'string' && data.payload.token.trim().length == _config.tokenSize ? data.payload.token.trim() : false;
  var extended = typeof(data.payload.extend) == 'boolean' ? data.payload.extend : false;

  if (token && extended) {
    _data.read('tokens', token, function (err, data) {
      if (!err && data) {
        if (data.expires > Date.now()) {
          data.expires = Date.now() + _config.tokenDuration;
          _data.update('tokens', data, function (err) {
            if (!err) {
              callback(200, data);
            } else {
              console.log(err);
              callback(500, {'Error': 'No se pudo actualizar el token'});
            }
          });
        } else {
          callback(400, {'Error': 'El token ya caduco, no puede ser extendido.'});  
        }
      } else {
        callback(400, {'Error': 'El token especificado es invalido.'});
      }
    });
  } else {
    callback(400, {'Error': 'Faltan parametros, la solicitud es invalida.'});
  }
};

// Tokens - delete (URI: /tokens?token={token})
handlers._tokens.delete = function (data, callback) {
  var token = typeof(data.queryStringObject.token) == 'string' && data.queryStringObject.token.trim().length == _config.tokenSize ? data.payload.token.trim() : false;
  if (token) {
    _data.read('tokens', token, function (err, data) {
      if (!err && data) {
        _data.delete('tokens', token, function (err) {
          if (!err) {
            callback(200);
          } else {
            callback(400, {'Error': 'No se pudo encontrar el token especificado.'});
          }
        });
      } else {
        callback(400, {'Error': 'No se pudo encontrar el token especificado.'});
      }
    });
  } else {
    callback(400, {'Error': 'Faltan parametros para continuar con la solicitud.'});
  }
};

module.exports = handlers;