/**
 * Homework 2 - Controlador el procesamiento de las ordenes
 */

// Dependencias node
const querystring = require('querystring')
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
handlers.payments = (req, callback) => {
  if (validators.isValidMethod(req.method, ['post', 'get'])) {
    handlers._payments[req.method](req, callback)
  } else {
    callback(405, { error: helpers.translate('error.method.not.allowed', req.lang) })
  }
}

handlers._payments = {}

/**
 * Shopping cart - get (URI: /payments?order)
 * @param req
 * @param callback
 * @example
 * curl -X GET 'http://{host}/payments?order={order}' -H 'email: {email}' -H 'token: {token}'
 */
handlers._payments.get = (req, callback) => {
  // Validar los parámetros de la solicitud.
  const token = validators.isValidTokenField(req.headers.token)
  const email = validators.isValidEmailField(req.headers.email)
  const order = validators.isValidTextField(req.queryStringObject.order)

  helpers.verifyToken(token, email, (isValid) => {
    if (isValid) {
      data.read('payments', order, (errRead, dataOrder) => {
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

        helpers.mailgun(email, `Orden #${order}`, message, (errMailgun) => {
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
handlers._payments.post = (req, callback) => {
  // Validar los parámetros de la solicitud.
  const token = validators.isValidTokenField(req.headers.token)
  const email = validators.isValidEmailField(req.headers.email)
  const creditCard = validators.isValidCardNumber(req.payload.creditCard)
  const validMonth = validators.isValidMonthOfYear(req.payload.validMonth)
  const validYear = validators.isValidYear(req.payload.validYear)
  const codeCard = validators.isValidCardCvv(req.payload.codeCard)

  helpers.verifyToken(token, email, (isValid) => {
    if (isValid) {
      data.read('users', email, (errRead, userData) => {
        if (!errRead) {
          data.read('orders', email, (errReadOrders, dataOrder) => {
            if (!errReadOrders && dataOrder) {
              let quantityItems = 0
              let totalItems = 0
              let messageItems = ''
              const currency = 'usd'
              const source = 'tok_visa'
              const orderId = `${helpers.createRandomString(16)}-${Date.now()}`
              const items = cleaners.getValidArrayObject(dataOrder)

              items.forEach((item) => {
                quantityItems += item.quantity
                const total = item.quantity * item.price
                totalItems += total
                messageItems += `<li>${item.name} (${item.quantity} * ${item.price} = ${total})</li>`
              })

              // Proceder al pago
              const payload = {
                cc: creditCard,
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

              helpers.stripe(payload, (errStripe) => {
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

                  helpers.mailgun(email, payload.description, message, (errMailgun) => {
                    if (errMailgun) {
                      callback(500, {
                        error: helpers.translate('error.sent.payment.confirm', req.lang),
                      })
                    }
                  })

                  // eslint-disable-next-line no-param-reassign
                  delete userData.password

                  const payment = {
                    user: userData,
                    message: message,
                    email: email,
                    items: messageItems,
                    payload: payload,
                    payloadString: payloadString,
                  }

                  data.create('payments', orderId, payment, (errCreate) => {
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
