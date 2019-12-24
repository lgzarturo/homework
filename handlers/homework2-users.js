/**
 * Homework 2 - Controlador del CRUD User
 */

// Dependencias libs
let _data = require('./../lib/data');
let _helpers = require('./../lib/helpers');

// Controlador dependiendo la solicitud URI
let handlers = {};

/**
 * Manejo de los metodos que seran aceptados en el controlador.
 * CRUD [post, get, put, delete]
 * @param data
 * @param callback
 */
handlers.users = function(data, callback) {
  let acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405, {
      error: _helpers.translate('error.method.not.allowed', data.lang)
    });
  }
};

// @ignore
handlers._users = {};

/**
 * Users - post (URI: /users)
 * @param data
 * @param callback
 */
handlers._users.post = function(data, callback) {
  // Validar los parámetros de la solicitud.
  let name =
    typeof data.payload.name === 'string' && data.payload.name.trim().length > 0
      ? data.payload.name.trim()
      : false;
  let email =
    typeof data.payload.email === 'string' &&
    data.payload.email.trim().length > 0
      ? data.payload.email.trim()
      : false;
  let password =
    typeof data.payload.password === 'string' &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  let streetAddress =
    typeof data.payload.streetAddress === 'string'
      ? data.payload.streetAddress.trim()
      : false;

  if (name && email && password && streetAddress) {
    _data.read('users', email, function(err, userData) {
      if (err && !userData) {
        let hashedPassword = _helpers.hash(password);
        if (hashedPassword) {
          let objectUser = {
            name: name,
            email: email,
            password: hashedPassword,
            streetAddress: streetAddress
          };
          _data.create('users', email, objectUser, function(err) {
            if (!err) {
              delete objectUser.password;
              callback(201, objectUser);
            } else {
              callback(409, {
                error: _helpers.translate('error.user.created', data.lang)
              });
            }
          });
        } else {
          callback(409, {
            error: _helpers.translate('error.user.password.encrypt', data.lang)
          });
        }
      } else {
        callback(409, {
          error: _helpers.translate('error.user.exists', data.lang)
        });
      }
    });
  } else {
    callback(400, {
      error: _helpers.translate('error.params.missing', data.lang)
    });
  }
};

/**
 * Users - get (URI: /users?email={?})
 * @param data
 * @param callback
 */
handlers._users.get = function(data, callback) {
  // Validar los parámetros de la solicitud.
  let email =
    typeof data.queryStringObject.email === 'string' &&
    data.queryStringObject.email.trim().length > 0
      ? data.queryStringObject.email.trim()
      : false;
  if (email) {
    let token =
      typeof data.headers.token === 'string' ? data.headers.token : false;
    _helpers.verifyToken(token, email, function(isValid) {
      if (isValid) {
        _data.read('users', email, function(err, userData) {
          if (!err && userData) {
            delete userData.password;
            callback(200, userData);
          } else {
            callback(404, {
              error: _helpers.translate('error.user.not.found', data.lang)
            });
          }
        });
      } else {
        callback(401, {
          error: _helpers.translate('error.token.invalid', data.lang)
        });
      }
    });
  } else {
    callback(400, {
      error: _helpers.translate('error.params.missing', data.lang)
    });
  }
};

/**
 * Users - put (URI: /users?email={?})
 * @param data
 * @param callback
 */
handlers._users.put = function(data, callback) {
  // Validar los parámetros de la solicitud.
  let email =
    typeof data.queryStringObject.email === 'string' &&
    data.queryStringObject.email.trim().length > 0
      ? data.queryStringObject.email.trim()
      : false;
  let name =
    typeof data.payload.name === 'string' && data.payload.name.trim().length > 0
      ? data.payload.name.trim()
      : false;
  let password =
    typeof data.payload.password === 'string' &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  let streetAddress =
    typeof data.payload.streetAddress === 'string'
      ? data.payload.streetAddress.trim()
      : false;

  if (email) {
    let token =
      typeof data.headers.token === 'string' ? data.headers.token : false;
    _helpers.verifyToken(token, email, function(isValid) {
      if (isValid) {
        if (name || password || streetAddress) {
          _data.read('users', email, function(err, data) {
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
              _data.update('users', email, data, function(err) {
                if (!err) {
                  callback(200, {
                    success: _helpers.translate(
                      'success.user.updated',
                      data.lang
                    )
                  });
                } else {
                  callback(409, {
                    error: _helpers.translate('error.user.updated', data.lang)
                  });
                }
              });
            } else {
              callback(404, {
                error: _helpers.translate('error.user.not.found', data.lang)
              });
            }
          });
        } else {
          callback(400, {
            error: _helpers.translate('error.params.missing', data.lang)
          });
        }
      } else {
        callback(401, {
          error: _helpers.translate('error.token.invalid', data.lang)
        });
      }
    });
  } else {
    callback(400, {
      error: _helpers.translate('error.params.missing', data.lang)
    });
  }
};

/**
 * Users - delete (URI: /users?email={?})
 * @param data
 * @param callback
 */
handlers._users.delete = function(data, callback) {
  // Validar los parámetros de la solicitud.
  let email =
    typeof data.queryStringObject.email === 'string' &&
    data.queryStringObject.email.trim().length > 0
      ? data.queryStringObject.email.trim()
      : false;

  if (email) {
    let token =
      typeof data.headers.token === 'string' ? data.headers.token : false;
    _helpers.verifyToken(token, email, function(isValid) {
      if (isValid) {
        _data.read('users', email, function(err, dataUser) {
          if (!err && dataUser) {
            _data.delete('users', email, function(err) {
              if (!err) {
                _data.delete('tokens', token, function(err) {
                  if (!err) {
                    let userChecks =
                      typeof dataUser.checks == 'object' &&
                      dataUser.checks instanceof Array &&
                      dataUser.checks.length > 0
                        ? dataUser.checks
                        : [];
                    let checksToDelete = userChecks.length;
                    if (checksToDelete > 0) {
                      let checksDeleted = 0;
                      let deletionErrors = false;
                      // Recorrer los checks
                      userChecks.forEach(function(checkId) {
                        _data.delete('checks', checkId, function(err) {
                          if (err) {
                            deletionErrors = true;
                          }
                          checksDeleted++;
                        });
                      });

                      if (checksDeleted === checksToDelete) {
                        if (!deletionErrors) {
                          callback(204);
                        } else {
                          callback(
                            200,
                            _helpers.translate(
                              'error.user.check.deleted',
                              data.lang
                            )
                          );
                        }
                      }
                    }
                    callback(204);
                  } else {
                    callback(404, {
                      error: _helpers.translate(
                        'error.token.invalid',
                        data.lang
                      )
                    });
                  }
                });
              } else {
                callback(400, {
                  error: _helpers.translate('error.user.deleted', data.lang)
                });
              }
            });
          } else {
            callback(404, {
              error: _helpers.translate('error.user.not.found', data.lang)
            });
          }
        });
      } else {
        callback(401, {
          error: _helpers.translate('error.token.invalid', data.lang)
        });
      }
    });
  }
};

// @ignore
module.exports = handlers;
