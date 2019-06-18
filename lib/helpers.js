/**
 * Tareas de ayuda
 */

// Dependencias
var crypto = require('crypto');
var https = require('https');
var querystring = require('querystring');

// Dependencias de la aplicación
var _config = require('./../config/config');
var _data = require('./data');

var lib = {};

// Encriptando con el hash SHA256
lib.hash = function (str) {
  if (typeof(str) == 'string' && str.length > 0) {
    return crypto.createHmac('sha256', _config.hashingSecret).update(str).digest('hex');
  }
  return false;
};

// Convertimos la cadena de JSON en un objeto
lib.parseJsonToObject = function (str) {
  try{
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
};

// Creación de cadenas aleatorias
lib.createRandomString = function (strLength) {
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if (strLength) {
    var posibleCharacters = 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789';
    var str = '';
    for (var i = 1; i <= strLength; i++) {
      var randomCharacter = posibleCharacters.charAt(Math.floor(Math.random() * posibleCharacters.length));
      str += randomCharacter;
    }
    return str;
  }
  return false;
};

lib.verifyToken = function (token, email, callback) {
  _data.read('tokens', token, function (err, data) {
    console.log(`Token ${token} : ${email}`);
    var isValid = false;
    if (!err && data) {
      console.log(`Data token ${data.email} : ${data.expires}`);
      isValid = (data.email == email && data.expires > Date.now()) ? true : false;
    }
    console.log(`Token is valid: ${isValid}`);
    callback(isValid);
  });
};

lib.stripe = function (payload, callback) {

  // Objteto para enviar al servicio
  var reqPayload = {
    'amount': Number(payload.amount),
    'currency': payload.currency,
    'description': payload.description,
    'source': payload.source
  };

  var stringPayload = querystring.stringify(reqPayload);
  var host = false;
  var key = false;
  var protocol = 'http:';

  // Obtener la configuración
  _data.read('private', 'api-keys', function (err, keys) {
    if (!err && keys) {
      console.log(keys);
      console.log(keys.stripe);

      host = keys.stripe.host;
      protocol = keys.stripe.protocol;
      key = keys.stripe.secretKey;

      var requestDetails = {
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

      var req = https.request(requestDetails, function (res) {
        var status = res.statusCode;
        if(status == 200 || status == 201) {
          callback(false);
        } else{
          console.log('No se ha podido generar el pago con Stripe', status);
          callback(403, {'Error': `API Stripe - Respuesta del servicio: ${status}`});
        }
      });

      req.on('error', function (err) {
        callback('Se ha generado un error: ', err);
      });

      req.write(stringPayload);
      req.end();

    } else{
      callback(505, {'Error':`Error en los datos privados ${err}`});
    }
  });
};

// Mailgun API request
lib.mailgun = function (to, subject, text, callback) {
  var fromEmail = false;
  var domainName = false;
  var key = false;
  var protocol = 'http:';
  var host = false;

  // Obtener la configuración
  _data.read('private', 'api-keys', function (err, keys) {
    if (!err && keys) {
      fromEmail = keys.mailgun.from;
      key = keys.mailgun.secretKey;
      domainName = keys.mailgun.domainName;
      protocol = keys.mailgun.protocol;
      host = keys.mailgun.host;

      // Objteto para enviar al servicio
      var reqPayload = {
        from: fromEmail,
        to: to,
        subject: subject,
        html: text
      };

      var stringPayload = querystring.stringify(reqPayload);

      // Detalles de la configuración de Mailgun
      var requestDetails = {
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

      var req = https.request(requestDetails, function (res) {
        var status = res.statusCode;

        if (status == 200 || status == 201) {
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

    } else{
      callback(505, {'Error':`Error en los datos privados ${err}`});
    }
  });

};

module.exports = lib;
