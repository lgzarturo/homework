/**
 * Homework 2 - Controlador del CRUD User
 */

// Dependencias libs
const data = require('../lib/data')
const helpers = require('../lib/helpers')
const validators = require('../validation/request_validation')
const checkers = require('../validation/request_clean')
// Controlador dependiendo la solicitud URI
const handlers = {}

/**
 * Manejo de los métodos que serán aceptados en el controlador.
 * CRUD [post, get, put, delete]
 * @param req
 * @param callback
 */
handlers.users = (req, callback) => {
  if (validators.isValidMethod(req.method)) {
    handlers._users[req.method](req, callback)
  } else {
    callback(405, {
      error: helpers.translate('error.method.not.allowed', req.lang),
    })
  }
}

handlers._users = {}

/**
 * Users - post (URI: /users)
 * @param req
 * @param callback
 */
handlers._users.post = (req, callback) => {
  // Validar los parámetros de la solicitud.
  const name = validators.isValidTextField(req.payload.name)
  const email = validators.isValidEmailField(req.payload.email)
  const phone = validators.isValidTextField(req.payload.phone, true)
  const password = validators.isValidPasswordField(req.payload.password)
  const streetAddress = validators.isValidTextField(req.payload.streetAddress, true)
  const tosAgreement = validators.isValidBooleanField(req.payload.tosAgreement)

  if (tosAgreement === false) {
    callback(409, { error: 'Debe aceptar los términos y condiciones del servicio' })
    return
  }

  if (name && email && password && tosAgreement) {
    data.read('users', email, (errRead, userData) => {
      if (errRead && !userData) {
        const hashedPassword = helpers.hash(password)
        if (hashedPassword) {
          const objectUser = {
            name: name,
            email: email,
            phone: phone,
            password: hashedPassword,
            streetAddress: streetAddress,
            tosAgreement: tosAgreement,
          }
          data.create('users', email, objectUser, (errCreate) => {
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
handlers._users.get = (req, callback) => {
  // Validar los parámetros de la solicitud.
  const email = validators.isValidEmailField(req.queryStringObject.email)
  if (email) {
    const token = validators.isValidTokenField(req.headers.token)
    helpers.verifyToken(token, email, (isValid) => {
      if (isValid) {
        data.read('users', email, (errRead, userData) => {
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
handlers._users.put = (req, callback) => {
  // Validar los parámetros de la solicitud.
  const email = validators.isValidEmailField(req.queryStringObject.email)
  const name = validators.isValidTextField(req.payload.name)
  const password = validators.isValidPasswordField(req.payload.password)
  const streetAddress = validators.isValidTextField(req.payload.streetAddress, true)

  if (email) {
    const token = validators.isValidTokenField(req.headers.token)
    helpers.verifyToken(token, email, (isValid) => {
      if (isValid) {
        if (name || password || streetAddress) {
          data.read('users', email, (errRead, userData) => {
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
              data.update('users', email, userData, (errUpdate) => {
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
        callback(401, { error: helpers.translate('error.token.invalid', req.lang) })
      }
    })
  } else {
    callback(400, { error: helpers.translate('error.params.missing', req.lang) })
  }
}

/**
 * Users - delete (URI: /users?email={?})
 * @param req
 * @param callback
 */
handlers._users.delete = (req, callback) => {
  // Validar los parámetros de la solicitud.
  const email = validators.isValidEmailField(req.queryStringObject.email)

  if (email) {
    const token = validators.isValidTokenField(req.headers.token)
    helpers.verifyToken(token, email, (isValid) => {
      if (isValid) {
        data.read('users', email, (errRead, dataUser) => {
          if (!errRead && dataUser) {
            data.delete('users', email, (errDelete) => {
              if (!errDelete) {
                data.delete('tokens', token, (errDeleteToken) => {
                  if (!errDeleteToken) {
                    const userChecks = checkers.getValidArrayObject(dataUser.checks)
                    const checksToDelete = userChecks.length
                    if (checksToDelete > 0) {
                      let checksDeleted = 0
                      let deletionErrors = false
                      // Recorrer los checks
                      userChecks.forEach((checkId) => {
                        data.delete('checks', checkId, (err) => {
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
                          callback(200, helpers.translate('error.user.check.deleted', req.lang))
                        }
                      }
                    }
                    callback(204)
                  } else {
                    callback(404, { error: helpers.translate('error.token.invalid', req.lang) })
                  }
                })
              } else {
                callback(400, { error: helpers.translate('error.user.deleted', req.lang) })
              }
            })
          } else {
            callback(404, { error: helpers.translate('error.user.not.found', req.lang) })
          }
        })
      } else {
        callback(401, { error: helpers.translate('error.token.invalid', req.lang) })
      }
    })
  }
}

module.exports = handlers
