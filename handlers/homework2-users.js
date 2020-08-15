/**
 * Homework 2 - Controlador del CRUD User
 */

// Dependencias libs
const data = require('../lib/data')
const helpers = require('../lib/helpers')
// Controlador dependiendo la solicitud URI
const handlers = {}

/**
 * Manejo de los métodos que serán aceptados en el controlador.
 * CRUD [post, get, put, delete]
 * @param req
 * @param callback
 */
handlers.users = function (req, callback) {
  const acceptableMethods = ['post', 'get', 'put', 'delete']
  if (acceptableMethods.indexOf(req.method) !== -1) {
    handlers.users[req.method](req, callback)
  } else {
    callback(405, {
      error: helpers.translate('error.method.not.allowed', req.lang),
    })
  }
}

handlers.users = {}

/**
 * Users - post (URI: /users)
 * @param req
 * @param callback
 */
handlers.users.post = function (req, callback) {
  // Validar los parámetros de la solicitud.
  const name = typeof req.payload.name === 'string' && req.payload.name.trim().length > 0 ? req.payload.name.trim() : false
  const email = typeof req.payload.email === 'string' && req.payload.email.trim().length > 0 ? req.payload.email.trim() : false
  const password = typeof req.payload.password === 'string' && req.payload.password.trim().length > 0 ? req.payload.password.trim() : false
  const streetAddress = typeof req.payload.streetAddress === 'string' ? req.payload.streetAddress.trim() : false

  if (name && email && password && streetAddress) {
    data.read('users', email, function (errRead, userData) {
      if (errRead && !userData) {
        const hashedPassword = helpers.hash(password)
        if (hashedPassword) {
          const objectUser = {
            name: name,
            email: email,
            password: hashedPassword,
            streetAddress: streetAddress,
          }
          data.create('users', email, objectUser, function (errCreate) {
            if (!errCreate) {
              delete objectUser.password
              callback(201, objectUser)
            } else {
              callback(409, { error: helpers.translate('error.user.created', req.lang) })
            }
          })
        } else {
          callback(409, { error: helpers.translate('error.user.password.encrypt', req.lang) })
        }
      } else {
        callback(409, { error: helpers.translate('error.user.exists', req.lang) })
      }
    })
  } else {
    callback(400, { error: helpers.translate('error.params.missing', req.lang) })
  }
}

/**
 * Users - get (URI: /users?email={?})
 * @param req
 * @param callback
 */
handlers.users.get = function (req, callback) {
  // Validar los parámetros de la solicitud.
  const email = typeof req.queryStringObject.email === 'string' && req.queryStringObject.email.trim().length > 0 ? req.queryStringObject.email.trim() : false
  if (email) {
    const token = typeof req.headers.token === 'string' ? req.headers.token : false
    helpers.verifyToken(token, email, function (isValid) {
      if (isValid) {
        data.read('users', email, function (errRead, userData) {
          if (!errRead && userData) {
            delete userData.password
            callback(200, userData)
          } else {
            callback(404, { error: helpers.translate('error.user.not.found', req.lang) })
          }
        })
      } else {
        callback(401, { error: helpers.translate('error.token.invalid', req.lang) })
      }
    })
  } else {
    callback(400, { error: helpers.translate('error.params.missing', req.lang) })
  }
}

/**
 * Users - put (URI: /users?email={?})
 * @param req
 * @param callback
 */
handlers.users.put = function (req, callback) {
  // Validar los parámetros de la solicitud.
  const email = typeof req.queryStringObject.email === 'string' && req.queryStringObject.email.trim().length > 0 ? req.queryStringObject.email.trim() : false
  const name = typeof req.payload.name === 'string' && req.payload.name.trim().length > 0 ? req.payload.name.trim() : false
  const password = typeof req.payload.password === 'string' && req.payload.password.trim().length > 0 ? req.payload.password.trim() : false
  const streetAddress = typeof req.payload.streetAddress === 'string' ? req.payload.streetAddress.trim() : false

  if (email) {
    const token = typeof req.headers.token === 'string' ? req.headers.token : false
    helpers.verifyToken(token, email, function (isValid) {
      if (isValid) {
        if (name || password || streetAddress) {
          data.read('users', email, function (errRead, userData) {
            if (!errRead && userData) {
              if (name) {
                userData.name = name
              }
              if (password) {
                userData.password = helpers.hash(password)
              }
              if (streetAddress) {
                userData.streetAddress = streetAddress
              }
              data.update('users', email, data, function (errUpdate) {
                if (!errUpdate) {
                  callback(200, { success: helpers.translate('success.user.updated', req.lang) })
                } else {
                  callback(409, { error: helpers.translate('error.user.updated', req.lang) })
                }
              })
            } else {
              callback(404, { error: helpers.translate('error.user.not.found', req.lang) })
            }
          })
        } else {
          callback(400, { error: helpers.translate('error.params.missing', req.lang) })
        }
      } else {
        callback(401, { error: helpers.translate('error.token.invalid', data.lang) })
      }
    })
  } else {
    callback(400, { error: helpers.translate('error.params.missing', data.lang) })
  }
}

/**
 * Users - delete (URI: /users?email={?})
 * @param req
 * @param callback
 */
handlers.users.delete = function (req, callback) {
  // Validar los parámetros de la solicitud.
  const email = typeof req.queryStringObject.email === 'string' && req.queryStringObject.email.trim().length > 0 ? req.queryStringObject.email.trim() : false

  if (email) {
    const token = typeof req.headers.token === 'string' ? req.headers.token : false
    helpers.verifyToken(token, email, function (isValid) {
      if (isValid) {
        data.read('users', email, function (errRead, dataUser) {
          if (!errRead && dataUser) {
            data.delete('users', email, function (errDelete) {
              if (!errDelete) {
                data.delete('tokens', token, function (errDeleteToken) {
                  if (!errDeleteToken) {
                    const userChecks = typeof dataUser.checks === 'object' && dataUser.checks instanceof Array && dataUser.checks.length > 0 ? dataUser.checks : []
                    const checksToDelete = userChecks.length
                    if (checksToDelete > 0) {
                      let checksDeleted = 0
                      let deletionErrors = false
                      // Recorrer los checks
                      userChecks.forEach(function (checkId) {
                        data.delete('checks', checkId, function (err) {
                          if (err) {
                            deletionErrors = true
                          }
                          checksDeleted += 1
                        })
                      })

                      if (checksDeleted === checksToDelete) {
                        if (!deletionErrors) {
                          callback(204)
                        } else {
                          callback(200, helpers.translate('error.user.check.deleted', data.lang))
                        }
                      }
                    }
                    callback(204)
                  } else {
                    callback(404, { error: helpers.translate('error.token.invalid', data.lang) })
                  }
                })
              } else {
                callback(400, { error: helpers.translate('error.user.deleted', data.lang) })
              }
            })
          } else {
            callback(404, { error: helpers.translate('error.user.not.found', data.lang) })
          }
        })
      } else {
        callback(401, { error: helpers.translate('error.token.invalid', data.lang) })
      }
    })
  }
}

module.exports = handlers
