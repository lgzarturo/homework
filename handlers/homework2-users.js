/**
 * Homework 2 - Controlador del CRUD User
 */

// Dependencias de la aplicacion
var _data = require('./../lib/data');
var _helpers = require('./../lib/helpers');

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
    _data.read('users', email, function (err, data) {
      if (err) {
        var hashedPassword = _helpers.hash(password);
        if (hashedPassword) {
          var objectUser = {
            'name' : name,
            'email' : email,
            'password' : hashedPassword,
            'streetAddress' : streetAddress
          };
          _data.create('users', email, objectUser, function (err) {
            if (!err) {
              callback(200);
            } else {
              callback(500, {'Error': 'No se pudo crear el usuario.'});
            }
          });
        } else {
          callback(500, {'Error': 'No se pudo generar el usuario, error con la contraseña.'});
        }
      } else {
        callback(400, {'Error': 'El usuario ya existe en el sistema.'});
      }
      console.log(data);
    });
  } else {
    callback(400, {'Error': 'Faltan parametros requeridos.'});
  }

};

// Users - get (URI: /users?email={email})
handlers._users.get = function (data, callback) {
  var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
  if (email) {
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    _helpers.verifyToken(token, email, function (isValid) {
      if (isValid) {

        _data.read('users', email, function (err, data) {
          if (!err && data) {
            delete data.password;
            callback(200, data);
          } else {
            callback(400);
          }
        });

      } else {
        callback(403, {'Error': 'El token es requerido o ya no es valido.'});
      }
    });

  } else {
    callback(400, {'Error': 'Faltan parametros requeridos.'});
  }
};

// Users - put (URI: /users?email={email})
handlers._users.put = function (data, callback) {
  var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;

  var name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var streetAddress = typeof(data.payload.streetAddress) == 'string' ? data.payload.streetAddress.trim() : false;

  if (email) {
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    _helpers.verifyToken(token, email, function (isValid) {
      if (isValid) {

        if (name || password || streetAddress) {
          _data.read('users', email, function (err, data) {
            if (!err && data) {
              if (name) {
                data.name = name;
              }
              if (password) {
                data.password = _helpers.hash(password);
              }
              if (streetAddress) {
                data.streetAddress = streetAddress;
              }

              _data.update('users', email, data, function (err) {
                if (!err) {
                  callback(200);
                } else{
                  callback(500, {'Error': 'No se pudo actualizar el usuario.'});
                }
              });
            } else {
              callback(400, {'Error': 'El usuario especificado no existe.'});
            }
            console.log(data);
          });
        } else {
          callback(400, {'Error': 'Faltan parametros requeridos.'});
        }

      } else {
        callback(403, {'Error': 'El token es requerido o ya no es valido.'});
      }
    });

  } else {
    callback(400, {'Error': 'Faltan parametros requeridos.'});
  }
};

// Users - delete (URI: /users?email={email})
handlers._users.delete = function (data, callback) {
  var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;

  if (email) {
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    _helpers.verifyToken(token, email, function (isValid) {
      if (isValid) {

        _data.read('users', email, function(err, data) {
          if (!err && data) {
            _data.delete('users', email, function(err) {
              if (!err) {
                _data.delete('tokens', token, function (err) {
                  if (!err) {
                    callback(200);
                  } else {
                    callback(200, {'Error': 'El usuario ya no existe, este token es invalido'});
                  }
                });
              } else {
                callback(400, {'Error': 'No se pudo eliminar el usuario especificado.'});
              }
            });
          } else {
            callback(400, {'Error': 'El usuario especificado no existe.'});
          }
        });

      } else {
        callback(403, {'Error': 'El token es requerido o ya no es valido.'});
      }
    });

  }
};

module.exports = handlers;
