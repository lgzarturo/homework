/**
 * Homework 2 - Controlador del CRUD User
 */

// Dependencias node
const querystring = require('querystring')
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
handlers.payments = function (req, callback) {
  const acceptableMethods = ['post', 'get']
  if (acceptableMethods.indexOf(req.method) !== -1) {
    handlers.payments[req.method](req, callback)
  } else {
    callback(405, { error: helpers.translate('error.method.not.allowed', req.lang) })
  }
}

handlers.payments = {}

/**
 * Shopping cart - get (URI: /payments?order)
 * @param req
 * @param callback
 * @example
 * curl -X GET 'http://{host}/payments?order={order}' -H 'email: {email}' -H 'token: {token}'
 */
handlers.payments.get = function (req, callback) {
  // Validar los parámetros de la solicitud.
  const token = typeof req.headers.token === 'string' ? req.headers.token : false
  const email = typeof req.headers.email === 'string' && req.headers.email.trim().length > 0 ? req.headers.email : false
  const order = typeof req.queryStringObject.order === 'string' && req.queryStringObject.order.trim().length > 0 ? req.queryStringObject.order.trim() : false

  helpers.verifyToken(token, email, function (isValid) {
    if (isValid) {
      data.read('payments', order, function (errRead, dataOrder) {
        const message = `
          <p>Pago procesado con la tarjeta '${dataOrder.payload.cc}' (${dataOrder.payload.source})</p>
          <h3>Descripción</h3>
          <ul>
            <li>Cantidad: ${dataOrder.payload.items}</li>
            <li>Total: ${dataOrder.payload.amount / 100} ${dataOrder.payload.currency}</li>
          </ul>
          <hr/>
          <pre>
          ${dataOrder.message}
          </pre>
          <hr/>
          Gracias por su pago
        `

        helpers.mailgun(email, `Orden #${order}`, message, function (errMailgun) {
          if (!errMailgun) {
            callback(200, { success: helpers.translate('success.sent.payment.confirm', req.lang) })
          } else {
            callback(500, { error: helpers.translate('error.sent.payment.confirm', req.lang) })
          }
        })
      })
    }
  })
}

/**
 * Shopping cart - post (URI: /payments)
 * @param req
 * @param callback
 */
handlers.payments.post = function (req, callback) {
  // Validar los parámetros de la solicitud.
  const token = typeof req.headers.token === 'string' ? req.headers.token : false
  const email = typeof req.headers.email === 'string' && req.headers.email.trim().length > 0 ? req.headers.email : false
  const creditCart = typeof req.payload.creditCart === 'string' && req.payload.creditCart.trim().length > 0 ? req.payload.creditCart.trim() : false
  const validMonth = typeof req.payload.validMonth === 'number' && req.payload.validMonth >= 1 && req.payload.validMonth <= 12 ? req.payload.validMonth : false
  const validYear = typeof req.payload.validYear === 'number' && req.payload.validYear >= 2018 ? req.payload.validYear : false
  const codeCard = typeof req.payload.codeCard === 'string' && req.payload.codeCard.trim().length === 3 ? req.payload.codeCard : false

  helpers.verifyToken(token, email, function (isValid) {
    if (isValid) {
      data.read('users', email, function (errRead, userData) {
        if (!errRead) {
          data.read('orders', email, function (errReadOrders, dataOrder) {
            if (!errReadOrders && dataOrder) {
              let quantityItems = 0
              let totalItems = 0
              let messageItems = ''
              const currency = 'usd'
              const source = 'tok_visa'
              const orderId = `${helpers.createRandomString(16)}-${Date.now()}`
              const items = typeof dataOrder === 'object' && dataOrder instanceof Array ? dataOrder : []

              items.forEach(function (item) {
                quantityItems += item.quantity
                const total = item.quantity * item.price
                totalItems += total
                messageItems += `<li>${item.name} (${item.quantity} * ${item.price} = ${total})</li>`
              })

              // Proceder al pago
              const payload = {
                cc: creditCart,
                month: validMonth,
                year: validYear,
                code: codeCard,
                items: quantityItems,
                amount: totalItems * 100,
                currency: currency,
                description: helpers.translate('success.payment.applied', req.lang),
                source: source,
                orderId: orderId,
              }

              helpers.stripe(payload, function (errStripe) {
                if (errStripe) {
                  callback(500, { error: helpers.translate('error.process.payment', req.lang) })
                } else {
                  const payloadString = querystring.stringify(payload)
                  const message = `
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
                  `

                  helpers.mailgun(email, payload.description, message, function (errMailgun) {
                    if (errMailgun) {
                      callback(500, {
                        error: helpers.translate('error.sent.payment.confirm', req.lang),
                      })
                    }
                  })

                  delete userData.password

                  const payment = {
                    user: userData,
                    message: message,
                    email: email,
                    items: messageItems,
                    payload: payload,
                    payloadString: payloadString,
                  }

                  data.create('payments', orderId, payment, function (errCreate) {
                    if (!errCreate) {
                      callback(200, payment)
                    } else {
                      callback(400, payment, errCreate)
                    }
                  })
                }
              })
            } else {
              callback(404, { error: helpers.translate('error.data.not.available', req.lang) })
            }
          })
        } else {
          callback(404, { error: helpers.translate('error.user.not.found', req.lang) })
        }
      })
    } else {
      callback(401, { error: helpers.translate('error.token.invalid', req.lang) })
    }
  })
}

module.exports = handlers
