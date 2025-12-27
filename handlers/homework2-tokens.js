/**
 * Homework 2 - Controlador del CRUD Token
 */

// Dependencias libs
const config = require('../config/config')
const data = require('../lib/data')
const helpers = require('../lib/helpers')
const validators = require('../validation/request_validation')
// Controlador dependiendo la solicitud URI
const handlers = {}

/**
 * Manejo de los métodos que serán aceptados en el controlador.
 * @param req
 * @param callback
 */
handlers.tokens = (req, callback) => {
  if (validators.isValidMethod(req.method)) {
    handlers._tokens[req.method](req, callback)
  } else {
    callback(405, { error: helpers.translate('error.method.not.allowed', req.lang) })
  }
}

handlers._tokens = {}

/**
 * Tokens - post (URI: /tokens)
 * @param req
 * @param callback
 */
handlers._tokens.post = (req, callback) => {
  // Validar los parámetros de la solicitud.
  const email = validators.isValidEmailField(req.payload.email)
  const password = validators.isValidPasswordField(req.payload.password)

  console.log({ email, password })

  if (email && password) {
    data.read('users', email, (errRead, user) => {
      if (!errRead && user) {
        const hashedPassword = helpers.hash(password)
        if (hashedPassword === user.password) {
          const token = helpers.createRandomString(config.tokenSize)
          const expires = Date.now() + config.tokenDuration
          const object = {
            email: email,
            token: token,
            expires: expires,
            created: new Date(),
          }

          data.create('tokens', token, object, (errCreate) => {
            if (!errCreate) {
              callback(200, object)
            } else {
              callback(401, { error: helpers.translate('error.token.generated', req.lang) })
            }
          })
        } else {
          callback(409, { error: helpers.translate('error.token.validate.login', req.lang) })
        }
      } else {
        callback(404, { error: helpers.translate('error.user.not.found', req.lang) })
      }
    })
  } else {
    callback(400, { error: helpers.translate('error.params.missing', req.lang) })
  }
}

/**
 * Tokens - get (URI: /tokens?token={?})
 * @param req
 * @param callback
 */
handlers._tokens.get = (req, callback) => {
  // Validar los parámetros de la solicitud.
  const token = validators.isValidTokenField(req.queryStringObject.token)

  if (token) {
    data.read('tokens', token, (err, dataToken) => {
      if (!err && dataToken) {
        callback(200, dataToken)
      } else {
        callback(404, { error: helpers.translate('error.token.not.found', req.lang) })
      }
    })
  } else {
    callback(400, {
      error: helpers.translate('error.params.missing', req.lang),
    })
  }
}

/**
 * Tokens - put (URI: /tokens)
 * @param req
 * @param callback
 */
handlers._tokens.put = (req, callback) => {
  // Validar los parámetros de la solicitud.
  const token = validators.isValidTokenField(req.payload.token)
  const extended = validators.isValidBooleanField(req.payload.extend)

  if (token && extended) {
    data.read('tokens', token, (err, dataToken) => {
      if (!err && dataToken) {
        if (dataToken.expires > Date.now()) {
          // eslint-disable-next-line no-param-reassign
          dataToken.expires = Date.now() + config.tokenDuration
          data.update('tokens', token, dataToken, (errUpdate) => {
            if (!errUpdate) {
              callback(200, dataToken)
            } else {
              callback(409, { error: helpers.translate('error.token.update', req.lang) })
            }
          })
        } else {
          callback(401, { error: helpers.translate('error.token.expires', req.lang) })
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
 * Tokens - delete (URI: /tokens?token={?})
 * @param req
 * @param callback
 */
handlers._tokens.delete = (req, callback) => {
  // Validar los parámetros de la solicitud.
  const token = validators.isValidTokenField(req.queryStringObject.token)

  if (token) {
    data.read('tokens', token, (errRead, dataToken) => {
      if (!errRead && dataToken) {
        data.delete('tokens', token, (errDelete) => {
          if (!errDelete) {
            callback(204)
          } else {
            callback(404, { error: helpers.translate('error.token.delete', req.lang) })
          }
        })
      } else {
        callback(404, { error: helpers.translate('error.token.not.found', req.lang) })
      }
    })
  } else {
    callback(400, { error: helpers.translate('error.params.missing', req.lang) })
  }
}

module.exports = handlers
