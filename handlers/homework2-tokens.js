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
handlers.tokens = function (data, callback) {
    let acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405, {'error': _helpers.translate('error.method.not.allowed', data.headers['accept-language'])});
    }
};

// @ignore
handlers._tokens = {};

/**
 * Tokens - post (URI: /tokens)
 * @param data
 * @param callback
 */
handlers._tokens.post = function (data, callback) {
    // Validar los parámetros de la solicitud.
    let email = typeof (data.payload.email) == 'string' ? data.payload.email.trim() : false;
    let password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (email && password) {
        _data.read('users', email, function (err, user) {
            if (!err && user) {
                let hashedPassword = _helpers.hash(password);
                if (hashedPassword === user.password) {
                    let token = _helpers.createRandomString(_config.tokenSize);
                    let expires = Date.now() + _config.tokenDuration;
                    let object = {
                        'email': email,
                        'token': token,
                        'expires': expires
                    };

                    _data.create('tokens', token, object, function (err) {
                        if (!err) {
                            callback(200, object);
                        } else {
                            callback(401, {'error': _helpers.translate('error.token.generated', data.headers['accept-language'])});
                        }
                    });
                } else {
                    callback(409, {'error': _helpers.translate('error.token.validate.login', data.headers['accept-language'])});
                }
            } else {
                callback(404, {'error': _helpers.translate('error.user.not.found', data.headers['accept-language'])});
            }
        });
    } else {
        callback(400, {'error': _helpers.translate('error.params.missing', data.headers['accept-language'])});
    }
};

/**
 * Tokens - get (URI: /tokens?token={?})
 * @param data
 * @param callback
 */
handlers._tokens.get = function (data, callback) {
    // Validar los parámetros de la solicitud.
    let token = typeof (data.queryStringObject.token) === 'string' && data.queryStringObject.token.trim().length === _config.tokenSize ? data.queryStringObject.token.trim() : false;

    if (token) {
        _data.read('tokens', token, function (err, data) {
            if (!err && data) {
                callback(200, data);
            } else {
                callback(404, {'error': _helpers.translate('error.token.not.found', data.headers['accept-language'])});
            }
        });
    } else {
        callback(400, {'error': _helpers.translate('error.params.missing', data.headers['accept-language'])});
    }
};

/**
 * Tokens - put (URI: /tokens)
 * @param data
 * @param callback
 */
handlers._tokens.put = function (data, callback) {
    // Validar los parámetros de la solicitud.
    let token = typeof (data.payload.token) === 'string' && data.payload.token.trim().length === _config.tokenSize ? data.payload.token.trim() : false;
    let extended = typeof (data.payload.extend) === 'boolean' ? data.payload.extend : false;

    if (token && extended) {
        _data.read('tokens', token, function (err, data) {
            if (!err && data) {
                if (data.expires > Date.now()) {
                    data.expires = Date.now() + _config.tokenDuration;
                    _data.update('tokens', token, data, function (err) {
                        if (!err) {
                            callback(200, data);
                        } else {
                            callback(409, {'error': _helpers.translate('error.token.update', data.headers['accept-language'])});
                        }
                    });
                } else {
                    callback(401, {'error': _helpers.translate('error.token.expires', data.headers['accept-language'])});
                }
            } else {
                callback(401, {'error': _helpers.translate('error.token.invalid', data.headers['accept-language'])});
            }
        });
    } else {
        callback(400, {'error': _helpers.translate('error.params.missing', data.headers['accept-language'])});
    }
};

/**
 * Tokens - delete (URI: /tokens?token={?})
 * @param data
 * @param callback
 */
handlers._tokens.delete = function (data, callback) {
    // Validar los parámetros de la solicitud.
    let token = typeof (data.queryStringObject.token) === 'string' && data.queryStringObject.token.trim().length === _config.tokenSize ? data.queryStringObject.token.trim() : false;

    if (token) {
        _data.read('tokens', token, function (err, data) {
            if (!err && data) {
                _data.delete('tokens', token, function (err) {
                    if (!err) {
                        callback(204);
                    } else {
                        callback(404, {'error': _helpers.translate('error.token.delete', data.headers['accept-language'])});
                    }
                });
            } else {
                callback(404, {'error': _helpers.translate('error.token.not.found', data.headers['accept-language'])});
            }
        });
    } else {
        callback(400, {'error': _helpers.translate('error.params.missing', data.headers['accept-language'])});
    }
};

// @ignore
module.exports = handlers;
