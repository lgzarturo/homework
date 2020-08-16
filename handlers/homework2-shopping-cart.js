/**
 * Homework 2 - Controlador para realizar el pago del carrito de compras
 */

// Dependencias libs
const data = require('../lib/data')
const helpers = require('../lib/helpers')
const validators = require('../validation/request_validation')
const cleaners = require('../validation/request_clean')
// Controlador dependiendo la solicitud URI
const handlers = {}

/**
 * Manejo de los métodos que serán aceptados en el controlador.
 * @param req
 * @param callback
 */
handlers.cart = (req, callback) => {
  if (validators.isValidMethod(req.method, ['post', 'get'])) {
    handlers._shopping[req.method](req, callback)
  } else {
    callback(405, {
      error: helpers.translate('error.method.not.allowed', req.lang),
    })
  }
}

handlers._shopping = {}

/**
 * Shopping cart - get (URI: /shopping-car)
 * @param req
 * @param callback
 */
handlers._shopping.get = (req, callback) => {
  // Validar los parámetros de la solicitud.
  const token = validators.isValidTokenField(req.headers.token)
  const email = validators.isValidEmailField(req.headers.email)

  helpers.verifyToken(token, email, (isValid) => {
    if (isValid) {
      data.read('orders', email, (errRead, dataOrder) => {
        if (!errRead) {
          let totalItems = 0
          let quantityItems = 0
          const items = cleaners.getValidArrayObject(dataOrder)
          items.forEach((item) => {
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
handlers._shopping.post = (req, callback) => {
  // Validar los parámetros de la solicitud.
  const token = validators.isValidTokenField(req.headers.token)
  const email = validators.isValidEmailField(req.headers.email)
  const code = validators.isValidTextField(req.payload.code)
  const quantity = validators.isValidNumberField(req.payload.quantity)

  helpers.verifyToken(token, email, (isValid) => {
    if (isValid) {
      if (code && quantity) {
        data.read('items', 'menu', (errRead, itemData) => {
          if (!errRead && itemData) {
            const item = itemData[code]
            if (typeof item !== 'undefined') {
              console.log({ item })
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
              data.read('orders', email, (errReadOrder, dataOrder) => {
                const items = cleaners.getValidArrayObject(dataOrder)
                items.push(itemObject)

                items.forEach((el) => {
                  quantityItems += el.quantity
                  totalItems += el.quantity * el.price
                })

                if (errReadOrder) {
                  data.create('orders', email, items, (errCreate) => {
                    if (!errCreate) {
                      callback(200, { quantity: quantityItems, total: totalItems })
                    } else {
                      callback(403, { error: helpers.translate('error.shopping.cart.created', req.lang) })
                    }
                  })
                } else {
                  data.update('orders', email, items, (errUpdate) => {
                    if (!errUpdate) {
                      callback(200, { quantity: quantityItems, total: totalItems })
                    } else {
                      callback(403, { error: helpers.translate('error.shopping.cart.add.items', req.lang) })
                    }
                  })
                }
              })
            } else {
              callback(404, { error: helpers.translate('error.item.not.exists', req.lang) })
            }
          } else {
            callback(404, { error: helpers.translate('error.data.not.available', req.lang) })
          }
        })
      } else {
        callback(400, { error: helpers.translate('error.data.not.added.to.order', req.lang) })
      }
    } else {
      callback(401, { error: helpers.translate('error.token.invalid', req.lang) })
    }
  })
}

module.exports = handlers
