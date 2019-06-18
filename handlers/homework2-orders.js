/**
 * Homework 2 - Controlador del CRUD User
 */

// Dependencias
var querystring = require('querystring');

// Dependencias de la aplicacion
var _data = require('./../lib/data');
var _helpers = require('./../lib/helpers');

// Controlador dependiendo la solicitud URI
var handlers = {};

// Manejo de los metodos que seran aceptados en el controlador.
handlers.payments = function (data, callback) {
  var acceptableMethods = ['post', 'get'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._payments[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._payments = {};

// Shopping cart - get (URI: /payments?order)
handlers._payments.get = function (data, callback) {
  var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  var email = typeof(data.headers.email) == 'string' && data.headers.email.trim().length > 0 ? data.headers.email : false;
  var order = typeof(data.queryStringObject.order) == 'string' && data.queryStringObject.order.trim().length > 0 ? data.queryStringObject.order.trim() : false;

  _helpers.verifyToken(token, email, function (isValid) {
    if (isValid) {
      _data.read('payments', order, function (err, data) {
        var message = `
          <h1>Hola ${data.user.name}</h1>
          <p>Reenvio del pago procesado con la tarjeta '${data.payload.cc}' (${data.payload.source})</p>
          <h2>Orden #${data.payload.orderId}</h2>
          <ol>${data.items}</ol>
          <h3>Descripción <small>(${data.message})</small></h3>
          <ul>
            <li>Cantidad: ${data.payload.items}</li>
            <li>Total: ${data.payload.amount} ${data.payload.currency}</li>
          </ul>
          --<br/>
          <code>
          ${data.payloadString}
          </code>
        `;

        _helpers.mailgun(email, `Reenvio de la Orden #${order}`, message, function (err) {
          if (err) {
            callback(500, {'Error': 'No se pudo envar el correo de confirmación de pago.'});
          }
        });
      });
    }
  });

};

// Shopping cart - post (URI: /payments)
handlers._payments.post = function (data, callback) {
  var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  var email = typeof(data.headers.email) == 'string' && data.headers.email.trim().length > 0 ? data.headers.email : false;

  var creditCart = typeof(data.payload.creditCart) == 'string' && data.payload.creditCart.trim().length > 0 ? data.payload.creditCart.trim() : false;
  var validMonth = typeof(data.payload.validMonth) == 'number' && data.payload.validMonth >= 1 && data.payload.validMonth <= 12 ? data.payload.validMonth : false;
  var validYear = typeof(data.payload.validYear) == 'number' && data.payload.validYear >= 2018 ? data.payload.validYear : false;
  var codeCard = typeof(data.payload.codeCard) == 'string' && data.payload.codeCard.trim().length == 3 ? data.payload.codeCard : false;

  _helpers.verifyToken(token, email, function (isValid) {
    if (isValid) {

      _data.read('users', email, function (err, userData) {
        if (!err) {

          _data.read('orders', email, function (err, data) {
            if (!err && data) {
              var quantityItems = 0;
              var totalItems = 0;
              var currency = 'usd';
              var source = 'tok_visa';
              var orderId = `${_helpers.createRandomString(16)}-${Date.now()}`;
              var messageItems = '';
              var items = typeof(data) == 'object' && data instanceof Array ? data : [];

              items.forEach(function (item) {
                quantityItems += item.quantity;
                var total = item.quantity * item.price;
                totalItems += total;
                messageItems += `<li>${item.name} (${item.quantity} * ${item.price} = ${total})</li>`;
              });

              // Proceder al pago
              var payload = {
                'cc' : creditCart,
                'month' : validMonth,
                'year' : validYear,
                'code' : codeCard,
                'items' : quantityItems,
                //'amount' : totalItems * 100,
                'amount' : totalItems,
                'currency' : currency,
                'description' : 'Cargo generado a su tarjeta de crédito.',
                'source' : source,
                'orderId' : orderId
              };

              _helpers.stripe(payload, function (err) {
                if (err) {
                  callback(500, {'Error': 'Se ha generado un error al procesar el pago'});
                } else {
                  var payloadString = querystring.stringify(payload);
                  var message = `
                    <h1>Hola ${userData.name}</h1>
                    <p>Se ha procesado el pago con la tarjeta '${payload.cc}' (${payload.source})</p>
                    <h2>Orden #${payload.orderId}</h2>
                    <ol>${messageItems}</ol>
                    <h3>Descripción <small>(${payload.description})</small></h3>
                    <ul>
                      <li>Cantidad: ${payload.items}</li>
                      <li>Total: ${payload.amount} ${payload.currency}</li>
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

                  var payment = {
                    'user' : userData,
                    'message' : message,
                    'email' : email,
                    'items': messageItems,
                    'payload' : payload,
                    'payloadString': payloadString
                  };

                  _data.create('payments', orderId, payment, function (err) {
                    if (!err) {
                      callback(200, payment);
                    } else{
                      callback(500, payment, err);
                    }
                  });

                }
              });

            } else {
              console.log(email);
              callback(400, {'Error': 'No se encontró una orden para procesar.'});
            }
          });

        } else {
          callback(400, {'Error': 'No se encontró el usuario para generar el pago.'});
        }
      });

    } else {
      callback(403, {'Error': 'El token es requerido o ya no es valido.'});
    }
  });
};

module.exports = handlers;
