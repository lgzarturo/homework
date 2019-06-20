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
 * @param data
 * @param callback
 */
handlers.cart = function (data, callback) {
    let acceptableMethods = ['post', 'get'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._shopping[data.method](data, callback);
    } else {
        callback(405, {'error': _helpers.translate('error.method.not.allowed', data.headers['accept-language'])});
    }
};

// @ignore
handlers._shopping = {};

/**
 * Shopping cart - get (URI: /shopping-car)
 * @param data
 * @param callback
 */
handlers._shopping.get = function (data, callback) {
    // Validar los parámetros de la solicitud.
    let token = typeof (data.headers.token) === 'string' ? data.headers.token : false;
    let email = typeof (data.headers.email) === 'string' && data.headers.email.trim().length > 0 ? data.headers.email : false;

    _helpers.verifyToken(token, email, function (isValid) {
        if (isValid) {
            _data.read('orders', email, function (err, data) {
                if (!err) {
                    let totalItems = 0;
                    let quantityItems = 0;
                    let items = typeof (data) === 'object' && data instanceof Array ? data : [];
                    items.forEach(function (item) {
                        quantityItems += item.quantity;
                        totalItems += item.quantity * item.price;
                    });
                    callback(200, {'data': data, 'quantity': quantityItems, 'total': totalItems});
                } else {
                    callback(404, {'error': _helpers.translate('error.data.not.available', data.headers['accept-language'])});
                }
            });
        } else {
            callback(401, {'error': _helpers.translate('error.token.invalid', data.headers['accept-language'])});
        }
    });
};

/**
 * Shopping cart - post (URI: /shopping-cart)
 * @param data
 * @param callback
 */
handlers._shopping.post = function (data, callback) {
    // Validar los parámetros de la solicitud.
    let token = typeof (data.headers.token) === 'string' ? data.headers.token : false;
    let email = typeof (data.headers.email) === 'string' && data.headers.email.trim().length > 0 ? data.headers.email : false;
    let code = typeof (data.payload.code) === 'string' && data.payload.code.trim().length > 0 ? data.payload.code.trim() : false;
    let quantity = typeof (data.payload.quantity) === 'number' && data.payload.quantity > 0 ? data.payload.quantity : false;

    _helpers.verifyToken(token, email, function (isValid) {
        if (isValid) {
            if (code && quantity) {
                _data.read('items', 'menu', function (err, itemData) {
                    if (!err && itemData) {
                        let item = itemData[code];
                        let totalItem = quantity * item.price;
                        let totalItems = 0;
                        let quantityItems = 0;
                        let itemObject = {
                            'id': code,
                            'name': item.name,
                            'description': item.description,
                            'price': item.price,
                            'quantity': quantity,
                            'total': totalItem
                        };

                        // Crear o actualizar la orden
                        _data.read('orders', email, function (err, data) {
                            let items = typeof (data) === 'object' && data instanceof Array ? data : [];
                            items.push(itemObject);

                            items.forEach(function (item) {
                                quantityItems += item.quantity;
                                totalItems += item.quantity * item.price;
                            });

                            if (err) {
                                _data.create('orders', email, items, function (err) {
                                    if (!err) {
                                        callback(200, {'quantity': quantityItems, 'total': totalItems});
                                    } else {
                                        callback(403, {'error': _helpers.translate('error.shopping.cart.created', data.headers['accept-language'])});
                                    }
                                });
                            } else {
                                _data.update('orders', email, items, function (err) {
                                    if (!err) {
                                        callback(200, {'quantity': quantityItems, 'total': totalItems});
                                    } else {
                                        callback(403, {'error': _helpers.translate('error.shopping.cart.add.items', data.headers['accept-language'])});
                                    }
                                });
                            }
                        });
                    } else {
                        callback(404, {'error': _helpers.translate('error.data.not.available', data.headers['accept-language'])});
                    }
                });
            } else {
                callback(400, {'error': 'No se pudo agregar el artículo a la orden de compra.'});
            }
        } else {
            callback(401, {'error': _helpers.translate('error.token.invalid', data.headers['accept-language'])});
        }
    });
};

// @ignore
module.exports = handlers;
