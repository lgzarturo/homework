/**
 * Homework 2 - Controlador del CRUD User
 */

// Dependencias de la aplicacion
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
handlers.users = function (data, callback) {
    let acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};

handlers._users = {};

/**
 * Users - post (URI: /users)
 * @param data
 * @param callback
 */
handlers._users.post = function (data, callback) {
    // Validar los parámetros de la solicitud.
    let name = typeof (data.payload.name) === 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;
    let email = typeof (data.payload.email) === 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
    let password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    let streetAddress = typeof (data.payload.streetAddress) === 'string' ? data.payload.streetAddress.trim() : false;

    if (name && email && password && streetAddress) {
        _data.read('users', email, function (err, data) {
            if (err) {
                let hashedPassword = _helpers.hash(password);
                if (hashedPassword) {
                    let objectUser = {
                        'name': name,
                        'email': email,
                        'password': hashedPassword,
                        'streetAddress': streetAddress
                    };
                    _data.create('users', email, objectUser, function (err) {
                        if (!err) {
                            callback(201, {'Success': `Se ha creado el usuario ${email}`});
                        } else {
                            callback(409, {'Error': 'No se pudo crear el usuario.'});
                        }
                    });
                } else {
                    callback(409, {'Error': 'No se pudo generar el usuario, error con la contraseña.'});
                }
            } else {
                callback(409, {'Error': 'El usuario ya existe en el sistema.'});
            }
        });
    } else {
        callback(400, {'Error': 'Faltan parametros requeridos.'});
    }
};

/**
 * Users - get (URI: /users?email={?})
 * @param data
 * @param callback
 */
handlers._users.get = function (data, callback) {
    // Validar los parámetros de la solicitud.
    let email = typeof (data.queryStringObject.email) === 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
    if (email) {
        let token = typeof (data.headers.token) === 'string' ? data.headers.token : false;
        _helpers.verifyToken(token, email, function (isValid) {
            if (isValid) {
                _data.read('users', email, function (err, data) {
                    if (!err && data) {
                        delete data.password;
                        callback(200, data);
                    } else {
                        callback(404, {'Error': 'No se pudo obtener el usuario indicado'});
                    }
                });

            } else {
                callback(401, {'Error': 'El token es requerido o ya no es valido.'});
            }
        });
    } else {
        callback(400, {'Error': 'Faltan parametros requeridos.'});
    }
};

/**
 * Users - put (URI: /users?email={?})
 * @param data
 * @param callback
 */
handlers._users.put = function (data, callback) {
    // Validar los parámetros de la solicitud.
    let email = typeof (data.queryStringObject.email) === 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
    let name = typeof (data.payload.name) === 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;
    let password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    let streetAddress = typeof (data.payload.streetAddress) === 'string' ? data.payload.streetAddress.trim() : false;

    if (email) {
        let token = typeof (data.headers.token) === 'string' ? data.headers.token : false;
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
                                    callback(200, {'Success': `Se actualizo con exito el usuario ${email}`});
                                } else {
                                    callback(409, {'Error': 'No se pudo actualizar el usuario.'});
                                }
                            });
                        } else {
                            callback(404, {'Error': 'El usuario especificado no existe.'});
                        }
                    });
                } else {
                    callback(400, {'Error': 'Faltan parametros requeridos.'});
                }
            } else {
                callback(401, {'Error': 'El token es requerido o ya no es valido.'});
            }
        });
    } else {
        callback(400, {'Error': 'Faltan parametros requeridos.'});
    }
};

/**
 * Users - delete (URI: /users?email={?})
 * @param data
 * @param callback
 */
handlers._users.delete = function (data, callback) {
    // Validar los parámetros de la solicitud.
    let email = typeof (data.queryStringObject.email) === 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;

    if (email) {
        let token = typeof (data.headers.token) === 'string' ? data.headers.token : false;
        _helpers.verifyToken(token, email, function (isValid) {
            if (isValid) {
                _data.read('users', email, function (err, data) {
                    if (!err && data) {
                        _data.delete('users', email, function (err) {
                            if (!err) {
                                _data.delete('tokens', token, function (err) {
                                    if (!err) {
                                        callback(204);
                                    } else {
                                        callback(404, {'Error': 'El usuario ya no existe, este token es invalido'});
                                    }
                                });
                            } else {
                                callback(400, {'Error': 'No se pudo eliminar el usuario especificado.'});
                            }
                        });
                    } else {
                        callback(404, {'Error': 'El usuario especificado no existe.'});
                    }
                });
            } else {
                callback(401, {'Error': 'El token es requerido o ya no es valido.'});
            }
        });
    }
};

module.exports = handlers;
