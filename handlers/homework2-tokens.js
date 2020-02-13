/**
 * Homework 2 - Controlador del CRUD Token
 */

// Dependencias libs
const config = require('./../config/config').default;

const data = require('./../lib/data');

const helpers = require('./../lib/helpers');
// Controlador dependiendo la solicitud URI
const handlers = {};

/**
 * Manejo de los metodos que seran aceptados en el controlador.
 * @param req
 * @param callback
 */
handlers.tokens = function(req, callback) {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(req.method) > -1) {
    handlers.tokens[req.method](req, callback);
  } else {
    callback(405, { error: helpers.translate('error.method.not.allowed', req.lang) });
  }
};

handlers.tokens = {};

/**
 * Tokens - post (URI: /tokens)
 * @param req
 * @param callback
 */
handlers.tokens.post = function(req, callback) {
  // Validar los parámetros de la solicitud.
  const email = typeof req.payload.email === 'string' ? req.payload.email.trim() : false;
  const password = typeof req.payload.password === 'string' && req.payload.password.trim().length > 0 ? req.payload.password.trim() : false;

  if (email && password) {
    data.read('users', email, function(errRead, user) {
      if (!errRead && user) {
        const hashedPassword = helpers.hash(password);
        if (hashedPassword === user.password) {
          const token = helpers.createRandomString(config.tokenSize);
          const expires = Date.now() + config.tokenDuration;
          const object = {
            email: email,
            token: token,
            expires: expires
          };

          data.create('tokens', token, object, function(errCreate) {
            if (!errCreate) {
              callback(200, object);
            } else {
              callback(401, { error: helpers.translate('error.token.generated', req.lang) });
            }
          });
        } else {
          callback(409, { error: helpers.translate('error.token.validate.login', req.lang) });
        }
      } else {
        callback(404, { error: helpers.translate('error.user.not.found', req.lang) });
      }
    });
  } else {
    callback(400, { error: helpers.translate('error.params.missing', req.lang) });
  }
};

/**
 * Tokens - get (URI: /tokens?token={?})
 * @param req
 * @param callback
 */
handlers.tokens.get = function(req, callback) {
  // Validar los parámetros de la solicitud.
  const token = typeof req.queryStringObject.token === 'string' && req.queryStringObject.token.trim().length === config.tokenSize ? req.queryStringObject.token.trim() : false;

  if (token) {
    data.read('tokens', token, function(err, dataToken) {
      if (!err && dataToken) {
        callback(200, dataToken);
      } else {
        callback(404, { error: helpers.translate('error.token.not.found', req.lang) });
      }
    });
  } else {
    callback(400, {
      error: helpers.translate('error.params.missing', req.lang)
    });
  }
};

/**
 * Tokens - put (URI: /tokens)
 * @param req
 * @param callback
 */
handlers.tokens.put = function(req, callback) {
  // Validar los parámetros de la solicitud.
  const token = typeof req.payload.token === 'string' && req.payload.token.trim().length === config.tokenSize ? req.payload.token.trim() : false;
  const extended = typeof req.payload.extend === 'boolean' ? req.payload.extend : false;

  if (token && extended) {
    data.read('tokens', token, function(err, dataToken) {
      if (!err && dataToken) {
        if (dataToken.expires > Date.now()) {
          dataToken.expires = Date.now() + config.tokenDuration;
          data.update('tokens', token, dataToken, function(errUpdate) {
            if (!errUpdate) {
              callback(200, dataToken);
            } else {
              callback(409, { error: helpers.translate('error.token.update', req.lang) });
            }
          });
        } else {
          callback(401, { error: helpers.translate('error.token.expires', req.lang) });
        }
      } else {
        callback(401, { error: helpers.translate('error.token.invalid', req.lang) });
      }
    });
  } else {
    callback(400, { error: helpers.translate('error.params.missing', req.lang) });
  }
};

/**
 * Tokens - delete (URI: /tokens?token={?})
 * @param req
 * @param callback
 */
handlers.tokens.delete = function(req, callback) {
  // Validar los parámetros de la solicitud.
  const token = typeof req.queryStringObject.token === 'string' && req.queryStringObject.token.trim().length === config.tokenSize ? req.queryStringObject.token.trim() : false;

  if (token) {
    data.read('tokens', token, function(errRead, dataToken) {
      if (!errRead && dataToken) {
        data.delete('tokens', token, function(errDelete) {
          if (!errDelete) {
            callback(204);
          } else {
            callback(404, { error: helpers.translate('error.token.delete', req.lang) });
          }
        });
      } else {
        callback(404, { error: helpers.translate('error.token.not.found', req.lang) });
      }
    });
  } else {
    callback(400, { error: helpers.translate('error.params.missing', req.lang) });
  }
};

module.exports = handlers;
