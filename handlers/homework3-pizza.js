/**
 * Homework 3
 * Controller para el frontend de Pizza-Delivery
 */

// Dependencias libs
const helpers = require('../lib/helpers')
const validators = require('../validation/request_validation')
// Controlador dependiendo la solicitud URI
const handlers = {}

/**
 * URI /items - Muestra los items disponibles para ordenar la pizza
 * @param req
 * @param callback
 */
handlers.items = (req, callback) => {
  if (req.method !== 'get') {
    callback(405, undefined, 'html')
  } else {
    const data = {
      'head.title': helpers.translate('pizza.items.page.title', req.lang),
      'head.description': helpers.translate('pizza.items.page.description', req.lang),
      'body.title': helpers.translate('pizza.items.title', req.lang),
      'body.class': 'pizzaItems',
    }

    helpers.getTemplate('pizza/items', data, (err, str) => {
      if (!err && str) {
        helpers.applyLayout(str, data, (errLayout, content) => {
          if (!errLayout && content) {
            callback(200, content, 'html')
          } else {
            callback(500, undefined, 'html')
          }
        })
      } else {
        callback(404, undefined, 'html')
      }
    })
  }
}

/**
 * URI /add - Agregar items al menu
 * @param req
 * @param callback
 */
handlers.add = (req, callback) => {
  if (req.method !== 'get') {
    callback(405, undefined, 'html')
  } else {
    const data = {
      'head.title': helpers.translate('pizza.add.item.page.title', req.lang),
      'head.description': helpers.translate('pizza.add.item.page.description', req.lang),
      'body.title': helpers.translate('pizza.add.item.title', req.lang),
      'body.class': 'pizzaAddItem',
    }

    helpers.getTemplate('pizza/add', data, (err, str) => {
      if (!err && str) {
        helpers.applyLayout(str, data, (errLayout, content) => {
          if (!errLayout && content) {
            callback(200, content, 'html')
          } else {
            callback(500, undefined, 'html')
          }
        })
      } else {
        callback(404, undefined, 'html')
      }
    })
  }
}

/**
 * URI /order - Crea el registro de la orden, se puede verificar el estado de la orden
 * @param req
 * @param callback
 */
handlers.order = (req, callback) => {
  if (req.method !== 'get') {
    callback(405, undefined, 'html')
  } else {
    const data = {
      'head.title': helpers.translate('pizza.order.page.title', req.lang),
      'head.description': helpers.translate('pizza.order.page.description', req.lang),
      'body.title': helpers.translate('pizza.order.title', req.lang),
      'body.class': 'pizzaOrder',
    }

    helpers.getTemplate('pizza/order', data, (err, str) => {
      if (!err && str) {
        helpers.applyLayout(str, data, (errLayout, content) => {
          if (!errLayout && content) {
            callback(200, content, 'html')
          } else {
            callback(500, undefined, 'html')
          }
        })
      } else {
        callback(404, undefined, 'html')
      }
    })
  }
}

/**
 * URI /shopping - Crea el carrito de compras
 * @param req
 * @param callback
 */
handlers.shopping = (req, callback) => {
  if (req.method !== 'get') {
    callback(405, undefined, 'html')
  } else {
    const data = {
      'head.title': helpers.translate('pizza.shopping.page.title', req.lang),
      'head.description': helpers.translate('pizza.shopping.page.description', req.lang),
      'body.title': helpers.translate('pizza.shopping.title', req.lang),
      'body.class': 'pizzaShopping',
    }

    helpers.getTemplate('pizza/shopping', data, (err, str) => {
      if (!err && str) {
        helpers.applyLayout(str, data, (errLayout, content) => {
          if (!errLayout && content) {
            callback(200, content, 'html')
          } else {
            callback(500, undefined, 'html')
          }
        })
      } else {
        callback(404, undefined, 'html')
      }
    })
  }
}

/**
 * URI /payment - Realiza el pago de la pizza
 * @param req
 * @param callback
 */
handlers.payment = (req, callback) => {
  if (req.method !== 'get') {
    callback(405, undefined, 'html')
  } else {
    const data = {
      'head.title': helpers.translate('pizza.payment.page.title', req.lang),
      'head.description': helpers.translate('pizza.payment.page.description', req.lang),
      'body.title': helpers.translate('pizza.payment.title', req.lang),
      'body.class': 'pizzaPayment',
    }

    helpers.getTemplate('pizza/payment', data, (err, str) => {
      if (!err && str) {
        helpers.applyLayout(str, data, (errLayout, content) => {
          if (!errLayout && content) {
            callback(200, content, 'html')
          } else {
            callback(500, undefined, 'html')
          }
        })
      } else {
        callback(404, undefined, 'html')
      }
    })
  }
}

module.exports = handlers
