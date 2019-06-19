/**
 * Tareas de ayuda
 */

// Dependencias
let crypto = require('crypto');
let https = require('https');
let querystring = require('querystring');

// Dependencias de la aplicación
let _config = require('./../config/config');
let _data = require('./data');

let lib = {};

/**
 * Encriptando con el hash SHA256
 * @param str
 * @returns {boolean|PromiseLike<ArrayBuffer>}
 */
lib.hash = function (str) {
    if (typeof (str) == 'string' && str.length > 0) {
        return crypto.createHmac('sha256', _config.hashingSecret).update(str).digest('hex');
    }
    return false;
};

/**
 * Convertimos la cadena de JSON en un objeto
 * @param str
 * @returns {{}|any}
 */
lib.parseJsonToObject = function (str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return {};
    }
};

/**
 * Creación de cadenas aleatorias
 * @param strLength
 * @returns {string|string|boolean}
 */
lib.createRandomString = function (strLength) {
    strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        let posibleCharacters = 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789';
        let str = '';
        for (let i = 1; i <= strLength; i++) {
            let randomCharacter = posibleCharacters.charAt(Math.floor(Math.random() * posibleCharacters.length));
            str += randomCharacter;
        }
        return str;
    }
    return false;
};

/**
 * Verificación del tiempo de vida del token
 * @param token
 * @param email
 * @param callback
 */
lib.verifyToken = function (token, email, callback) {
    _data.read('tokens', token, function (err, data) {
        let isValid = false;
        if (!err && data) {
            console.log(`Data token ${data.email} : ${data.expires}`);
            isValid = (data.email === email && data.expires > Date.now());
        }
        console.log(`Token ${token} : ${email} is valid: ${isValid}`);
        callback(isValid);
    });
};

/**
 * Solicitud de pago mediante Stripe.com
 * @param payload
 * @param callback
 */
lib.stripe = function (payload, callback) {
    // Objteto para enviar al servicio
    let reqPayload = {
        'amount': Number(payload.amount),
        'currency': payload.currency,
        'description': payload.description,
        'source': payload.source
    };

    let stringPayload = querystring.stringify(reqPayload);
    let host = false;
    let key = false;
    let protocol = 'http:';

    // Obtener la configuración
    _data.read('private', 'api-keys', function (err, keys) {
        if (!err && keys) {
            console.log(keys);
            console.log(keys.stripe);

            host = keys.stripe.host;
            protocol = keys.stripe.protocol;
            key = keys.stripe.secretKey;

            let requestDetails = {
                protocol: protocol,
                host: host,
                method: 'POST',
                auth: key,
                path: '/v1/charges',
                payload: stringPayload,
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(stringPayload)
                }
            };

            let req = https.request(requestDetails, function (res) {
                let status = res.statusCode;
                if (status === 200 || status === 201) {
                    callback(false);
                } else {
                    console.log('No se ha podido generar el pago con Stripe', status);
                    callback(403, {'Error': `API Stripe - Respuesta del servicio: ${status}`});
                }
            });

            req.on('error', function (err) {
                callback('Se ha generado un error: ', err);
            });

            req.write(stringPayload);
            req.end();

        } else {
            callback(401, {'Error': `Error en los datos privados ${err}`});
        }
    });
};

/**
 * Envio de correo mediante el API de Mailgun.com
 * @param to
 * @param subject
 * @param text
 * @param callback
 */
lib.mailgun = function (to, subject, text, callback) {
    let fromEmail = false;
    let domainName = false;
    let key = false;
    let protocol = 'http:';
    let host = false;

    // Obtener la configuración
    _data.read('private', 'api-keys', function (err, keys) {
        if (!err && keys) {
            fromEmail = keys.mailgun.from;
            key = keys.mailgun.secretKey;
            domainName = keys.mailgun.domainName;
            protocol = keys.mailgun.protocol;
            host = keys.mailgun.host;

            // Objteto para enviar al servicio
            let reqPayload = {
                from: fromEmail,
                to: to,
                subject: subject,
                html: text
            };

            let stringPayload = querystring.stringify(reqPayload);

            // Detalles de la configuración de Mailgun
            let requestDetails = {
                auth: `api:${key}`,
                protocol: protocol,
                host: host,
                method: 'POST',
                path: `/v3/${domainName}/messages`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(stringPayload)
                }
            };

            let req = https.request(requestDetails, function (res) {
                let status = res.statusCode;

                if (status === 200 || status === 201) {
                    callback(false);
                } else {
                    console.log('Error en Mailgun');
                    callback(`API Mailgun - Respuesta del servicio: ${status}`);
                }
            });

            req.on('error', function (err) {
                callback(`Se ha generado un error: ${err}`);
            });

            req.write(stringPayload);
            req.end();

        } else {
            callback(401, {'Error': `Error en los datos privados ${err}`});
        }
    });
};

module.exports = lib;
