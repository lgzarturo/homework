/**
 * Homework 2 - Controlador para el registro de checks
 */

// Dependencias libs
const config = require('../config/config')
const data = require('../lib/data')
const helpers = require('../lib/helpers')
const validators = require('../validation/request_validation')
const cleaners = require('../validation/request_clean')
// Controlador dependiendo la solicitud URI
const handlers = {}

/**
 * Manejo de los métodos que serán aceptados en el controlador.
 * @param req
 * @param callback
 */
handlers.checks = (req, callback) => {
  if (validators.isValidMethod(req.method)) {
    handlers._checks[req.method](req, callback)
  } else {
    callback(405, { error: helpers.translate('error.method.not.allowed', req.lang) })
  }
}

handlers._checks = {}

/**
 * Checks - post (URI: /checks)
 * @param req
 * @param callback
 */
handlers._checks.post = (req, callback) => {
  // Validar los parámetros de la solicitud
  const protocol = validators.isValidProtocolValue(req.payload.protocol)
  const url = validators.isValidTextField(req.payload.url)
  const method = validators.isValidMethodValue(req.payload.method)
  const successCodes = validators.isValidArrayObject(req.payload.successCodes)
  const timeoutSeconds = validators.isValidTimeInSeconds(req.payload.timeoutSeconds)

  if (protocol && url && method && successCodes && timeoutSeconds) {
    const token = validators.isValidTokenField(req.headers.token)
    if (token) {
      data.read('tokens', token, (errRead, tokenData) => {
        if (!errRead && tokenData) {
          const userEmail = tokenData.email

          data.read('users', userEmail, (errReadUsers, userData) => {
            if (!errReadUsers && userData) {
              const userChecks = cleaners.getValidArrayObject(userData.checks)
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

                data.create('checks', checkId, checkObject, (errCreate) => {
                  if (!errCreate) {
                    // Agregar el check al usuario
                    userData.checks = userChecks
                    userData.checks.push(checkId)
                    data.update('users', userEmail, userData, (errUpdate) => {
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
handlers._checks.get = (req, callback) => {
  // Validar los parámetros de la solicitud.
  const id = validators.isValidTextFieldSize(req.queryStringObject.id, 48)
  console.log({ id })
  if (id) {
    data.read('checks', id, (err, checkData) => {
      if (!err && checkData) {
        const token = validators.isValidTokenField(req.headers.token)
        helpers.verifyToken(token, checkData.userEmail, (isValid) => {
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
handlers._checks.put = (req, callback) => {
  // Validar los parámetros de la solicitud.
  const id = validators.isValidTextFieldSize(req.queryStringObject.id, 48)
  const protocol = validators.isValidProtocolValue(req.payload.protocol)
  const url = validators.isValidTextField(req.payload.url)
  const method = validators.isValidMethodValue(req.payload.method)
  const successCodes = validators.isValidArrayObject(req.payload.successCodes)
  const timeoutSeconds = validators.isValidTimeInSeconds(req.payload.timeoutSeconds)

  if (id) {
    if (protocol || url || method || successCodes || timeoutSeconds) {
      data.read('checks', id, (errRead, checkData) => {
        if (!errRead && checkData) {
          const token = validators.isValidTokenField(req.headers.token)
          helpers.verifyToken(token, checkData.userEmail, (isValid) => {
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
              data.update('checks', id, checkData, (err) => {
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

handlers._checks.delete = (req, callback) => {
  const id = validators.isValidTextFieldSize(req.queryStringObject.id, 48)
  if (id) {
    data.read('checks', id, (errRead, checkData) => {
      if (!errRead && checkData) {
        const token = validators.isValidTokenField(req.headers.token)
        helpers.verifyToken(token, checkData.userEmail, (isValid) => {
          if (isValid) {
            data.delete('checks', id, (errDelete) => {
              if (!errDelete) {
                data.read('users', checkData.userEmail, (errReadUsers, userData) => {
                  if (!errReadUsers && userData) {
                    const userChecks = cleaners.getValidArrayObject(userData.checks)
                    const checkPosition = userChecks.indexOf(id)
                    if (checkPosition > -1) {
                      userChecks.splice(checkPosition, 1)
                      data.update('users', checkData.userEmail, userData, (err) => {
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
