/**
 * Homework 2 - Controlador del CRUD User
 */

// Dependencias
let querystring = require('querystring');

// Dependencias de la aplicacion
let _data = require('./../lib/data');
let _helpers = require('./../lib/helpers');

// Controlador dependiendo la solicitud URI
let handlers = {};

/**
 * Manejo de los metodos que seran aceptados en el controlador.
 * @param data
 * @param callback
 */
handlers.payments = function (data, callback) {
    let acceptableMethods = ['post', 'get'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._payments[data.method](data, callback);
    } else {
        callback(405);
    }
};

handlers._payments = {};

/**
 * Shopping cart - get (URI: /payments?order)
 * @param data
 * @param callback
 * @example
 * curl -X GET 'http://{host}/payments?order={order}' -H 'email: {email}' -H 'token: {token}'
 */
handlers._payments.get = function (data, callback) {
    // Validar los parámetros de la solicitud.
    let token = typeof (data.headers.token) === 'string' ? data.headers.token : false;
    let email = typeof (data.headers.email) === 'string' && data.headers.email.trim().length > 0 ? data.headers.email : false;
    let order = typeof (data.queryStringObject.order) === 'string' && data.queryStringObject.order.trim().length > 0 ? data.queryStringObject.order.trim() : false;

    _helpers.verifyToken(token, email, function (isValid) {
        if (isValid) {
            _data.read('payments', order, function (err, data) {
                let message = `
                    <p>Reenvio del pago procesado con la tarjeta '${data.payload.cc}' (${data.payload.source})</p>
                    <h3>Descripción</h3>
                    <ul>
                      <li>Cantidad: ${data.payload.items}</li>
                      <li>Total: ${data.payload.amount / 100} ${data.payload.currency}</li>
                    </ul>
                    <hr/>
                    <pre>
                    ${data.message}
                    </pre>
                    <hr/>
                    Gracias por su pago
                `;

                _helpers.mailgun(email, `Reenvio de la Orden #${order}`, message, function (err) {
                    if (err) {
                        callback(500, {'Error': 'No se pudo envar el correo de confirmación de pago.'});
                    } else {
                        callback(200, {'Success': `Se reenvión el comprobante del orden #${order} al correo ${email}`});
                    }
                });
            });
        }
    });
};

/**
 * Shopping cart - post (URI: /payments)
 * @param data
 * @param callback
 */
handlers._payments.post = function (data, callback) {
    // Validar los parámetros de la solicitud.
    let token = typeof (data.headers.token) === 'string' ? data.headers.token : false;
    let email = typeof (data.headers.email) === 'string' && data.headers.email.trim().length > 0 ? data.headers.email : false;
    let creditCart = typeof (data.payload.creditCart) === 'string' && data.payload.creditCart.trim().length > 0 ? data.payload.creditCart.trim() : false;
    let validMonth = typeof (data.payload.validMonth) === 'number' && data.payload.validMonth >= 1 && data.payload.validMonth <= 12 ? data.payload.validMonth : false;
    let validYear = typeof (data.payload.validYear) === 'number' && data.payload.validYear >= 2018 ? data.payload.validYear : false;
    let codeCard = typeof (data.payload.codeCard) === 'string' && data.payload.codeCard.trim().length === 3 ? data.payload.codeCard : false;

    _helpers.verifyToken(token, email, function (isValid) {
        if (isValid) {
            _data.read('users', email, function (err, userData) {
                if (!err) {
                    _data.read('orders', email, function (err, data) {
                        if (!err && data) {
                            let quantityItems = 0;
                            let totalItems = 0;
                            let currency = 'usd';
                            let source = 'tok_visa';
                            let orderId = `${_helpers.createRandomString(16)}-${Date.now()}`;
                            let messageItems = '';
                            let items = typeof (data) === 'object' && data instanceof Array ? data : [];

                            items.forEach(function (item) {
                                quantityItems += item.quantity;
                                let total = item.quantity * item.price;
                                totalItems += total;
                                messageItems += `<li>${item.name} (${item.quantity} * ${item.price} = ${total})</li>`;
                            });

                            // Proceder al pago
                            let payload = {
                                'cc': creditCart,
                                'month': validMonth,
                                'year': validYear,
                                'code': codeCard,
                                'items': quantityItems,
                                'amount': totalItems * 100,
                                'currency': currency,
                                'description': 'Cargo generado a su tarjeta de crédito.',
                                'source': source,
                                'orderId': orderId
                            };

                            _helpers.stripe(payload, function (err) {
                                if (err) {
                                    callback(500, {'Error': 'Se ha generado un error al procesar el pago'});
                                } else {
                                    let payloadString = querystring.stringify(payload);
                                    let message = `
                                        <h1>Hola ${userData.name}</h1>
                                        <p>Se ha procesado el pago con la tarjeta '${payload.cc}' (${payload.source})</p>
                                        <h2>Orden #${payload.orderId}</h2>
                                        <ol>${messageItems}</ol>
                                        <h3>Descripción <small>(${payload.description})</small></h3>
                                        <ul>
                                          <li>Cantidad: ${payload.items}</li>
                                          <li>Total: ${payload.amount / 100} ${payload.currency}</li>
                                        </ul>
                                        <p><strong>Gracias por su pago</strong></p>
                                        --<br/>
                                        <code>
                                        ${payloadString}
                                        </code>
                                    `;

                                    _helpers.mailgun(email, payload.description, message, function (err) {
                                        if (err) {
                                            callback(500, {'Error': 'No se pudo envar el correo de confirmación de pago.'});
                                        }
                                    });

                                    delete userData.password;

                                    let payment = {
                                        'user': userData,
                                        'message': message,
                                        'email': email,
                                        'items': messageItems,
                                        'payload': payload,
                                        'payloadString': payloadString
                                    };

                                    _data.create('payments', orderId, payment, function (err) {
                                        if (!err) {
                                            callback(200, payment);
                                        } else {
                                            callback(400, payment, err);
                                        }
                                    });
                                }
                            });
                        } else {
                            callback(404, {'Error': 'No se encontró una orden para procesar.'});
                        }
                    });

                } else {
                    callback(404, {'Error': 'No se encontró el usuario para generar el pago.'});
                }
            });
        } else {
            callback(401, {'Error': 'El token es requerido o ya no es valido.'});
        }
    });
};

module.exports = handlers;
