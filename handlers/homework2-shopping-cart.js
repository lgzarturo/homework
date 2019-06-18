/**
 * Homework 2 - Controlador del CRUD User
 */

// Dependencias de la aplicacion
var _data = require('./../lib/data');
var _helpers = require('./../lib/helpers');

// Controlador dependiendo la solicitud URI
var handlers = {};

// Manejo de los metodos que seran aceptados en el controlador.
handlers.cart = function (data, callback) {
  var acceptableMethods = ['post', 'get'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._shopping[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._shopping = {};

// Shopping cart - ger (URI: /shopping-car)
handlers._shopping.get = function (data, callback) {
  let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  let email = typeof(data.headers.email) == 'string' && data.headers.email.trim().length > 0 ? data.headers.email : false;

  _helpers.verifyToken(token, email, function (isValid) {
    if (isValid) {
      _data.read('orders', email, function (err, data) {
        if (err) {
          callback(404, {'Error': 'No se pudo obtener el carrito de compras.'});
        } else{
          var totalItems = 0;
          var quantityItems = 0;
          var items = typeof(data) == 'object' && data instanceof Array ? data : [];
          items.forEach(function (item) {
            quantityItems += item.quantity;
            totalItems += item.quantity * item.price;
          });
          callback(200, {'Data': data, 'Cantidad': quantityItems, 'Total': totalItems});
        }
      });
    } else {
      callback(403, {'Error': 'El token es requerido o ya no es valido.'});
    }
  });
};

// Shopping cart - post (URI: /shopping-cart)
handlers._shopping.post = function (data, callback) {
  var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  var email = typeof(data.headers.email) == 'string' && data.headers.email.trim().length > 0 ? data.headers.email : false;

  var code = typeof(data.payload.code) == 'string' && data.payload.code.trim().length > 0 ? data.payload.code.trim() : false;
  var quantity = typeof(data.payload.quantity) == 'number' && data.payload.quantity > 0 ? data.payload.quantity : false;

  _helpers.verifyToken(token, email, function (isValid) {
    if (isValid) {

      if (code && quantity) {
        // Obtener el item
        _data.read('items', 'menu', function (err, itemData) {
          if (!err && itemData) {
            var item = itemData[code];
            var totalItem = quantity * item.price;
            var totalItems = 0;
            var quantityItems = 0;
            var itemObject = {
              'id': code,
              'name': item.name,
              'description': item.description,
              'price': item.price,
              'quantity': quantity,
              'total': totalItem
            };

            // Crear o actualizar la orden
            _data.read('orders', email, function (err, data) {
              var items = typeof(data) == 'object' && data instanceof Array ? data : [];
              items.push(itemObject);

              items.forEach(function (item) {
                quantityItems += item.quantity;
                totalItems += item.quantity * item.price;
              });

              if (err) {
                _data.create('orders', email, items, function (err) {
                  if (!err) {
                    callback(200, {'Cantidad': quantityItems, 'Total': totalItems});
                  } else {
                    callback(500, {'Error': 'No se pudo crear el carrito de compras.'});
                  }
                });
              } else{
                _data.update('orders', email, items, function (err) {
                  if (!err) {
                    callback(200, {'Cantidad': quantityItems, 'Total': totalItems});
                  } else{
                    callback(500, {'Error': 'No se pudo agregar el item al carrito de compras.'});
                  }
                });
              }
            });
          } else {
            callback(400);
          }
        });
      } else {
        callback(400, {'Error': 'No se pudo agregar el artículo a la orden de compra.'});
      }

    } else {
      callback(403, {'Error': 'El token es requerido o ya no es valido.'});
    }
  });
};

module.exports = handlers;
