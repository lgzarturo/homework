/**
 * Homework 2 - Controlador del CRUD Token
 */

// Dependencias libs
const config = require('../config/config').default
const data = require('../lib/data')
const helpers = require('../lib/helpers')
// Controlador dependiendo la solicitud URI
const handlers = {}

/**
 * Manejo de los métodos que serán aceptados en el controlador.
 * @param req
 * @param callback
 */
handlers.checks = function (req, callback) {
  const acceptableMethods = ['post', 'get', 'put', 'delete']
  if (acceptableMethods.indexOf(req.method) !== -1) {
    handlers.checks[req.method](req, callback)
  } else {
    callback(405, { error: helpers.translate('error.method.not.allowed', req.lang) })
  }
}

handlers.checks = {}

const isValidMethod = (req) => {
  return ['get', 'post', 'put', 'delete'].indexOf(req.payload.method) !== -1
}

const isValidProtocol = (req) => {
  return ['http', 'https'].indexOf(req.payload.protocol) !== -1
}

/**
 * Checks - post (URI: /checks)
 * @param req
 * @param callback
 */
handlers.checks.post = function (req, callback) {
  // Validar los parámetros de la solicitud
  const protocol = typeof req.payload.protocol === 'string' && isValidProtocol(req) ? req.payload.protocol : false
  const url = typeof req.payload.url === 'string' && req.payload.url.trim().length > 0 ? req.payload.url.trim() : false
  const method = typeof req.payload.method === 'string' && isValidMethod(req) ? req.payload.method : false
  const successCodes = typeof req.payload.successCodes === 'object' && req.payload.successCodes instanceof Array && req.payload.successCodes.length > 0 ? req.payload.successCodes : false
  const timeoutSeconds = typeof req.payload.timeoutSeconds === 'number' && req.payload.timeoutSeconds % 1 === 0 && req.payload.timeoutSeconds >= 1 && req.payload.timeoutSeconds <= 5 ? req.payload.timeoutSeconds : false

  if (protocol && url && method && successCodes && timeoutSeconds) {
    const token = typeof req.headers.token === 'string' ? req.headers.token : false
    if (token) {
      data.read('tokens', token, function (errRead, tokenData) {
        if (!errRead && tokenData) {
          const userEmail = tokenData.email

          data.read('users', userEmail, function (errReadUsers, userData) {
            if (!errReadUsers && userData) {
              const userChecks = typeof userData.checks === 'object' && userData.checks instanceof Array && userData.checks.length > 0 ? userData.checks : []
              if (userChecks.length < config.maxChecks) {
                const checkId = helpers.createRandomString(48)
                const checkObject = {
                  id: checkId,
                  userEmail: userEmail,
                  protocol: protocol,
                  url: url,
                  method: method,
                  successCodes: successCodes,
                  timeoutSeconds: timeoutSeconds,
                }
                data.create('checks', checkId, checkObject, function (errCreate) {
                  if (!errCreate) {
                    // Agregar el check al usuario
                    userData.checks = userChecks
                    userData.checks.push(checkId)
                    data.update('users', userEmail, userData, function (errUpdate) {
                      if (!errUpdate) {
                        callback(200, checkObject)
                      } else {
                        callback(403, { error: helpers.translate('error.user.update.checks', req.lang) })
                      }
                    })
                  } else {
                    callback(403, { error: helpers.translate('error.checks.created', req.lang) })
                  }
                })
              } else {
                callback(400, { error: helpers.translate('error.user.max.checks', req.lang) })
              }
            } else {
              callback(403)
            }
          })
        } else {
          callback(403)
        }
      })
    }
  } else {
    callback(400, {
      error: helpers.translate('error.params.missing', req.lang),
    })
  }
}

/**
 * Checks - get (URI: /checks)
 * @param req
 * @param callback
 */
handlers.checks.get = function (req, callback) {
  // Validar los parámetros de la solicitud.
  const id = typeof req.queryStringObject.id === 'string' && req.queryStringObject.id.trim().length === 48 ? req.queryStringObject.id.trim() : false
  if (id) {
    data.read('checks', id, function (err, checkData) {
      if (!err && checkData) {
        const token = typeof req.headers.token === 'string' ? req.headers.token : false
        helpers.verifyToken(token, checkData.userEmail, function (isValid) {
          if (isValid) {
            callback(200, checkData)
          } else {
            callback(401, { error: helpers.translate('error.token.invalid', req.lang) })
          }
        })
      } else {
        callback(404)
      }
    })
  } else {
    callback(400, { error: helpers.translate('error.params.missing', req.lang) })
  }
}

/**
 *
 * @param req
 * @param callback
 */
handlers.checks.put = function (req, callback) {
  // Validar los parámetros de la solicitud.
  const id = typeof req.queryStringObject.id === 'string' && req.queryStringObject.id.trim().length === 48 ? req.queryStringObject.id.trim() : false
  const protocol = typeof req.payload.protocol === 'string' && isValidProtocol(req) ? req.payload.protocol : false
  const url = typeof req.payload.url === 'string' && req.payload.url.trim().length > 0 ? req.payload.url.trim() : false
  const method = typeof req.payload.method === 'string' && isValidMethod(req) ? req.payload.method : false
  const successCodes = typeof req.payload.successCodes === 'object' && req.payload.successCodes instanceof Array && req.payload.successCodes.length > 0 ? req.payload.successCodes : false
  const timeoutSeconds = typeof req.payload.timeoutSeconds === 'number' && req.payload.timeoutSeconds % 1 === 0 && req.payload.timeoutSeconds >= 1 && req.payload.timeoutSeconds <= 5 ? req.payload.timeoutSeconds : false

  if (id) {
    if (protocol || url || method || successCodes || timeoutSeconds) {
      data.read('checks', id, function (errRead, checkData) {
        if (!errRead && checkData) {
          const token = typeof req.headers.token === 'string' ? req.headers.token : false
          helpers.verifyToken(token, checkData.userEmail, function (isValid) {
            if (isValid) {
              if (protocol) {
                checkData.protocol = protocol
              }
              if (url) {
                checkData.url = url
              }
              if (method) {
                checkData.method = method
              }
              if (successCodes) {
                checkData.successCodes = successCodes
              }
              if (timeoutSeconds) {
                checkData.timeoutSeconds = timeoutSeconds
              }
              data.update('checks', id, checkData, function (err) {
                if (!err) {
                  callback(200, checkData)
                } else {
                  callback(409, { error: helpers.translate('error.record.updated', req.lang) })
                }
              })
            } else {
              callback(401, { error: helpers.translate('error.token.invalid', req.lang) })
            }
          })
        } else {
          callback(404)
        }
      })
    } else {
      callback(400, { error: helpers.translate('error.check.missing.fields', req.lang) })
    }
  } else {
    callback(400, { error: helpers.translate('error.params.missing', req.lang) })
  }
}

handlers.checks.delete = function (req, callback) {
  const id = typeof req.queryStringObject.id === 'string' && req.queryStringObject.id.trim().length === 48 ? req.queryStringObject.id.trim() : false
  if (id) {
    data.read('checks', id, function (errRead, checkData) {
      if (!errRead && checkData) {
        const token = typeof req.headers.token === 'string' ? req.headers.token : false
        helpers.verifyToken(token, checkData.userEmail, function (isValid) {
          if (isValid) {
            data.delete('checks', id, function (errDelete) {
              if (!errDelete) {
                data.read('users', checkData.userEmail, function (errReadUsers, userData) {
                  if (!errReadUsers && userData) {
                    const userChecks = typeof userData.checks === 'object' && userData.checks instanceof Array && userData.checks.length > 0 ? userData.checks : []
                    const checkPosition = userChecks.indexOf(id)
                    if (checkPosition > -1) {
                      userChecks.splice(checkPosition, 1)
                      data.update('users', checkData.userEmail, userData, function (err) {
                        if (!err) {
                          callback(204)
                        } else {
                          callback(409, {
                            error: helpers.translate('error.user.updated', req.lang),
                          })
                        }
                      })
                    } else {
                      callback(500)
                    }
                  } else {
                    callback(409, {
                      error: helpers.translate('error.check.user.found', req.lang),
                    })
                  }
                })
              } else {
                callback(409, {
                  error: helpers.translate('error.record.delete', req.lang),
                })
              }
            })
          } else {
            callback(401, {
              error: helpers.translate('error.token.invalid', req.lang),
            })
          }
        })
      } else {
        callback(404)
      }
    })
  } else {
    callback(400, {
      error: helpers.translate('error.params.missing', req.lang),
    })
  }
}

module.exports = handlers
