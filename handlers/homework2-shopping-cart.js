/**
 * Homework 2 - Controlador del CRUD User
 */

// Dependencias libs
const data = require('../lib/data')
const helpers = require('../lib/helpers')
// Controlador dependiendo la solicitud URI
const handlers = {}

/**
 * Manejo de los métodos que serán aceptados en el controlador.
 * @param req
 * @param callback
 */
handlers.cart = function (req, callback) {
  const acceptableMethods = ['post', 'get']
  if (acceptableMethods.indexOf(req.method) !== -1) {
    handlers.shopping[req.method](req, callback)
  } else {
    callback(405, {
      error: helpers.translate('error.method.not.allowed', req.lang),
    })
  }
}

handlers.shopping = {}

/**
 * Shopping cart - get (URI: /shopping-car)
 * @param req
 * @param callback
 */
handlers.shopping.get = function (req, callback) {
  // Validar los parámetros de la solicitud.
  const token = typeof req.headers.token === 'string' ? req.headers.token : false
  const email = typeof req.headers.email === 'string' && req.headers.email.trim().length > 0 ? req.headers.email : false

  helpers.verifyToken(token, email, function (isValid) {
    if (isValid) {
      data.read('orders', email, function (errRead, dataOrder) {
        if (!errRead) {
          let totalItems = 0
          let quantityItems = 0
          const items = typeof dataOrder === 'object' && dataOrder instanceof Array ? dataOrder : []
          items.forEach(function (item) {
            quantityItems += item.quantity
            totalItems += item.quantity * item.price
          })
          callback(200, { data: dataOrder, quantity: quantityItems, total: totalItems })
        } else {
          callback(404, { error: helpers.translate('error.data.not.available', req.lang) })
        }
      })
    } else {
      callback(401, { error: helpers.translate('error.token.invalid', req.lang) })
    }
  })
}

/**
 * Shopping cart - post (URI: /shopping-cart)
 * @param req
 * @param callback
 */
handlers.shopping.post = function (req, callback) {
  // Validar los parámetros de la solicitud.
  const token = typeof req.headers.token === 'string' ? req.headers.token : false
  const email = typeof req.headers.email === 'string' && req.headers.email.trim().length > 0 ? req.headers.email : false
  const code = typeof req.payload.code === 'string' && req.payload.code.trim().length > 0 ? req.payload.code.trim() : false
  const quantity = typeof req.payload.quantity === 'number' && req.payload.quantity > 0 ? req.payload.quantity : false

  helpers.verifyToken(token, email, function (isValid) {
    if (isValid) {
      if (code && quantity) {
        data.read('items', 'menu', function (errRead, itemData) {
          if (!errRead && itemData) {
            const item = itemData[code]
            const totalItem = quantity * item.price
            let totalItems = 0
            let quantityItems = 0
            const itemObject = {
              id: code,
              name: item.name,
              description: item.description,
              price: item.price,
              quantity: quantity,
              total: totalItem,
            }

            // Crear o actualizar la orden
            data.read('orders', email, function (errReadOrder, dataOrder) {
              const items = typeof dataOrder === 'object' && dataOrder instanceof Array ? dataOrder : []
              items.push(itemObject)

              items.forEach(function (el) {
                quantityItems += el.quantity
                totalItems += el.quantity * el.price
              })

              if (errReadOrder) {
                data.create('orders', email, items, function (errCreate) {
                  if (!errCreate) {
                    callback(200, { quantity: quantityItems, total: totalItems })
                  } else {
                    callback(403, { error: helpers.translate('error.shopping.cart.created', req.lang) })
                  }
                })
              } else {
                data.update('orders', email, items, function (errUpdate) {
                  if (!errUpdate) {
                    callback(200, { quantity: quantityItems, total: totalItems })
                  } else {
                    callback(403, { error: helpers.translate('error.shopping.cart.add.items', req.lang) })
                  }
                })
              }
            })
          } else {
            callback(404, { error: helpers.translate('error.data.not.available', req.lang) })
          }
        })
      } else {
        callback(400, { error: 'No se pudo agregar el artículo a la orden de compra.' })
      }
    } else {
      callback(401, { error: helpers.translate('error.token.invalid', req.lang) })
    }
  })
}

module.exports = handlers
