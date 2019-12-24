/**
 * Homework 2 - Controlador del CRUD Token
 */

// Dependencias libs
let _config = require('./../config/config');
let _data = require('./../lib/data');
let _helpers = require('./../lib/helpers');

// Controlador dependiendo la solicitud URI
let handlers = {};

/**
 * Manejo de los metodos que seran aceptados en el controlador.
 * @param data
 * @param callback
 */
handlers.checks = function(data, callback) {
  let acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data, callback);
  } else {
    callback(405, {
      error: _helpers.translate('error.method.not.allowed', data.lang)
    });
  }
};

// @ignore
handlers._checks = {};

/**
 * Checks - post (URI: /checks)
 * @param data
 * @param callback
 */
handlers._checks.post = function(data, callback) {
  // Validar los parámetros de la solicitud
  let protocol =
    typeof data.payload.protocol === 'string' &&
    ['http', 'https'].indexOf(data.payload.protocol) > -1
      ? data.payload.protocol
      : false;
  let url =
    typeof data.payload.url === 'string' && data.payload.url.trim().length > 0
      ? data.payload.url.trim()
      : false;
  let method =
    typeof data.payload.method === 'string' &&
    ['get', 'post', 'put', 'delete'].indexOf(data.payload.method) > -1
      ? data.payload.method
      : false;
  let successCodes =
    typeof data.payload.successCodes === 'object' &&
    data.payload.successCodes instanceof Array &&
    data.payload.successCodes.length > 0
      ? data.payload.successCodes
      : false;
  let timeoutSeconds =
    typeof data.payload.timeoutSeconds === 'number' &&
    data.payload.timeoutSeconds % 1 === 0 &&
    data.payload.timeoutSeconds >= 1 &&
    data.payload.timeoutSeconds <= 5
      ? data.payload.timeoutSeconds
      : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {
    let token =
      typeof data.headers.token == 'string' ? data.headers.token : false;
    if (token) {
      _data.read('tokens', token, function(err, tokenData) {
        if (!err && tokenData) {
          let userEmail = tokenData.email;

          _data.read('users', userEmail, function(err, userData) {
            if (!err && userData) {
              let userChecks =
                typeof userData.checks == 'object' &&
                userData.checks instanceof Array &&
                userData.checks.length > 0
                  ? userData.checks
                  : [];
              if (userChecks.length < _config.maxChecks) {
                let checkId = _helpers.createRandomString(48);
                let checkObject = {
                  id: checkId,
                  userEmail: userEmail,
                  protocol: protocol,
                  url: url,
                  method: method,
                  successCodes: successCodes,
                  timeoutSeconds: timeoutSeconds
                };
                _data.create('checks', checkId, checkObject, function(err) {
                  if (!err) {
                    // Agregar el check al usuario
                    userData.checks = userChecks;
                    userData.checks.push(checkId);
                    _data.update('users', userEmail, userData, function(err) {
                      if (!err) {
                        callback(200, checkObject);
                      } else {
                        callback(403, {
                          error: _helpers.translate(
                            'error.user.update.checks',
                            data.lang
                          )
                        });
                      }
                    });
                  } else {
                    callback(403, {
                      error: _helpers.translate(
                        'error.checks.created',
                        data.lang
                      )
                    });
                  }
                });
              } else {
                callback(400, {
                  error: _helpers.translate('error.user.max.checks', data.lang)
                });
              }
            } else {
              callback(403);
            }
          });
        } else {
          callback(403);
        }
      });
    }
  } else {
    callback(400, {
      error: _helpers.translate('error.params.missing', data.lang)
    });
  }
};

/**
 * Checks - get (URI: /checks)
 * @param data
 * @param callback
 */
handlers._checks.get = function(data, callback) {
  // Validar los parámetros de la solicitud.
  let id =
    typeof data.queryStringObject.id === 'string' &&
    data.queryStringObject.id.trim().length === 48
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    _data.read('checks', id, function(err, checkData) {
      if (!err && checkData) {
        let token =
          typeof data.headers.token === 'string' ? data.headers.token : false;
        _helpers.verifyToken(token, checkData.userEmail, function(isValid) {
          if (isValid) {
            callback(200, checkData);
          } else {
            callback(401, {
              error: _helpers.translate('error.token.invalid', data.lang)
            });
          }
        });
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, {
      error: _helpers.translate('error.params.missing', data.lang)
    });
  }
};

/**
 *
 * @param data
 * @param callback
 */
handlers._checks.put = function(data, callback) {
  // Validar los parámetros de la solicitud.
  let id =
    typeof data.queryStringObject.id === 'string' &&
    data.queryStringObject.id.trim().length === 48
      ? data.queryStringObject.id.trim()
      : false;
  let protocol =
    typeof data.payload.protocol === 'string' &&
    ['http', 'https'].indexOf(data.payload.protocol) > -1
      ? data.payload.protocol
      : false;
  let url =
    typeof data.payload.url === 'string' && data.payload.url.trim().length > 0
      ? data.payload.url.trim()
      : false;
  let method =
    typeof data.payload.method === 'string' &&
    ['get', 'post', 'put', 'delete'].indexOf(data.payload.method) > -1
      ? data.payload.method
      : false;
  let successCodes =
    typeof data.payload.successCodes === 'object' &&
    data.payload.successCodes instanceof Array &&
    data.payload.successCodes.length > 0
      ? data.payload.successCodes
      : false;
  let timeoutSeconds =
    typeof data.payload.timeoutSeconds === 'number' &&
    data.payload.timeoutSeconds % 1 === 0 &&
    data.payload.timeoutSeconds >= 1 &&
    data.payload.timeoutSeconds <= 5
      ? data.payload.timeoutSeconds
      : false;

  if (id) {
    if (protocol || url || method || successCodes || timeoutSeconds) {
      _data.read('checks', id, function(err, checkData) {
        if (!err && checkData) {
          let token =
            typeof data.headers.token === 'string' ? data.headers.token : false;
          _helpers.verifyToken(token, checkData.userEmail, function(isValid) {
            if (isValid) {
              if (protocol) {
                checkData.protocol = protocol;
              }
              if (url) {
                checkData.url = url;
              }
              if (method) {
                checkData.method = method;
              }
              if (successCodes) {
                checkData.successCodes = successCodes;
              }
              if (timeoutSeconds) {
                checkData.timeoutSeconds = timeoutSeconds;
              }
              _data.update('checks', id, checkData, function(err) {
                if (!err) {
                  callback(200, checkData);
                } else {
                  callback(409, {
                    error: _helpers.translate('error.record.updated', data.lang)
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
          callback(404);
        }
      });
    } else {
      callback(400, {
        error: _helpers.translate('error.check.missing.fields', data.lang)
      });
    }
  } else {
    callback(400, {
      error: _helpers.translate('error.params.missing', data.lang)
    });
  }
};

handlers._checks.delete = function(data, callback) {
  let id =
    typeof data.queryStringObject.id === 'string' &&
    data.queryStringObject.id.trim().length === 48
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    _data.read('checks', id, function(err, checkData) {
      if (!err && checkData) {
        let token =
          typeof data.headers.token === 'string' ? data.headers.token : false;
        _helpers.verifyToken(token, checkData.userEmail, function(isValid) {
          if (isValid) {
            _data.delete('checks', id, function(err) {
              if (!err) {
                _data.read('users', checkData.userEmail, function(
                  err,
                  userData
                ) {
                  if (!err && userData) {
                    let userChecks =
                      typeof userData.checks == 'object' &&
                      userData.checks instanceof Array &&
                      userData.checks.length > 0
                        ? userData.checks
                        : [];
                    let checkPosition = userChecks.indexOf(id);
                    if (checkPosition > -1) {
                      userChecks.splice(checkPosition, 1);
                      _data.update(
                        'users',
                        checkData.userEmail,
                        userData,
                        function(err) {
                          if (!err) {
                            callback(204);
                          } else {
                            callback(409, {
                              error: _helpers.translate(
                                'error.user.updated',
                                data.lang
                              )
                            });
                          }
                        }
                      );
                    } else {
                      callback(500);
                    }
                  } else {
                    callback(409, {
                      error: _helpers.translate(
                        'error.check.user.found',
                        data.lang
                      )
                    });
                  }
                });
              } else {
                callback(409, {
                  error: _helpers.translate('error.record.delete', data.lang)
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
        callback(404);
      }
    });
  } else {
    callback(400, {
      error: _helpers.translate('error.params.missing', data.lang)
    });
  }
};

// @ignore
module.exports = handlers;
