/**
 * Homework 2 - Controlador para la notificación SMS con Twilio
 */

// Dependencias libs
const data = require('../lib/data')
const helpers = require('../lib/helpers')
const validators = require('../validation/request_validation')
// Controlador dependiendo la solicitud URI
const handlers = {}

/**
 * Manejo de los métodos que serán aceptados en el controlador.
 * @param req
 * @param callback
 */
handlers.sms = (req, callback) => {
  if (validators.isValidMethod(req.method, ['get'])) {
    handlers._sms[req.method](req, callback)
  } else {
    callback(405, { error: helpers.translate('error.method.not.allowed', req.lang) })
  }
}

handlers._sms = {}

/**
 * SMS Notificación - get (URI: /sms?order)
 * @param req
 * @param callback
 * curl -X GET 'http://{host}/sms?order={order}' -H 'email: {email}' -H 'token: {token}' -H 'phone: {phone}'
 */
handlers._sms.get = (req, callback) => {
  // Validar los parámetros de la solicitud.
  const token = validators.isValidTokenField(req.headers.token)
  const email = validators.isValidEmailField(req.headers.email)
  const phone = validators.isValidPhoneField(req.headers.phone)
  const order = validators.isValidTextField(req.queryStringObject.order)

  helpers.verifyToken(token, email, (isValid) => {
    if (isValid) {
      data.read('payments', order, (errRead, dataOrder) => {
        helpers.twilio(phone, `Orden #${order}, pagada ${dataOrder.payload.amount / 100} ${dataOrder.payload.currency}`, (errTwilio) => {
          if (!errTwilio) {
            callback(200, { success: helpers.translate('success.sent.sms', req.lang) })
          } else {
            callback(500, { error: helpers.translate('error.sent.sms', req.lang) })
          }
        })
      })
    }
  })
}

module.exports = handlers
