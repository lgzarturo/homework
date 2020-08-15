/**
 * Funciones de ayuda
 */

// Dependencias
const crypto = require('crypto')
const https = require('https')
const querystring = require('querystring')
// Dependencias libs
const config = require('../config/config').default
const data = require('./data')

const lib = {}

/**
 * Encriptando con el hash SHA256
 * @param str
 * @returns {boolean|PromiseLike<ArrayBuffer>}
 */
lib.hash = function (str) {
  if (typeof str === 'string' && str.length > 0) {
    return crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
  }
  return false
}

/**
 * Convertimos la cadena de JSON en un objeto
 * @param str
 * @returns {{}|any}
 */
lib.parseJsonToObject = function (str) {
  try {
    return JSON.parse(str)
  } catch (ignore) {
    return {}
  }
}

/**
 * Creación de cadenas aleatorias
 * @param strLength
 * @returns {string|string|boolean}
 */
lib.createRandomString = function (strLength) {
  const lengthString = typeof strLength === 'number' && strLength > 0 ? strLength : false
  if (lengthString) {
    const posibleCharacters = 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789'
    let str = ''
    for (let i = 1; i <= strLength; i += 1) {
      const randomCharacter = posibleCharacters.charAt(Math.floor(Math.random() * posibleCharacters.length))
      str += randomCharacter
    }
    return str
  }
  return false
}

/**
 * Verificación del tiempo de vida del token
 * @param token
 * @param email
 * @param callback
 */
lib.verifyToken = function (token, email, callback) {
  data.read('tokens', token, function (err, responseData) {
    let isValid = false
    if (!err && responseData) {
      console.log(`Data token ${responseData.email} : ${responseData.expires}`)
      isValid = responseData.email === email && responseData.expires > Date.now()
    }
    console.log(`Token ${token} : ${email} is valid: ${isValid}`)
    callback(isValid)
  })
}

/**
 * Solicitud de pago mediante Stripe.com
 * @param payload
 * @param callback
 */
lib.stripe = function (payload, callback) {
  // Objeto para enviar al servicio
  const reqPayload = {
    amount: Number(payload.amount),
    currency: payload.currency,
    description: payload.description,
    source: payload.source,
  }

  const stringPayload = querystring.stringify(reqPayload)
  let host = false
  let key = false
  let protocol = 'http:'

  // Obtener la configuración
  data.read('private', 'api-keys', function (errRead, keys) {
    if (!errRead && keys) {
      host = keys.stripe.host
      protocol = keys.stripe.protocol
      key = keys.stripe.secretKey

      const requestDetails = {
        protocol: protocol,
        host: host,
        method: 'POST',
        auth: key,
        path: '/v1/charges',
        payload: stringPayload,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(stringPayload),
        },
      }

      const req = https.request(requestDetails, function (res) {
        const status = res.statusCode
        if (status === 200 || status === 201) {
          callback(false)
        } else {
          console.log('No se ha podido generar el pago con Stripe', status)
          callback(403, {
            error: `API Stripe - Respuesta del servicio: ${status}`,
          })
        }
      })

      req.on('error', function (errOn) {
        callback('Se ha generado un error: ', errOn)
      })

      req.write(stringPayload)
      req.end()
    } else {
      callback(401, { error: `Error en los datos privados ${errRead}` })
    }
  })
}

/**
 * Envío de correo mediante el API de Mailgun.com
 * @param to
 * @param subject
 * @param text
 * @param callback
 */
lib.mailgun = function (to, subject, text, callback) {
  let fromEmail = false
  let domainName = false
  let key = false
  let protocol = 'http:'
  let host = false

  // Obtener la configuración
  data.read('private', 'api-keys', function (errRead, keys) {
    if (!errRead && keys) {
      fromEmail = keys.mailgun.from
      key = keys.mailgun.secretKey
      domainName = keys.mailgun.domainName
      protocol = keys.mailgun.protocol
      host = keys.mailgun.host

      // Objeto para enviar al servicio
      const reqPayload = {
        from: fromEmail,
        to: to,
        subject: subject,
        html: text,
      }

      const stringPayload = querystring.stringify(reqPayload)

      // Detalles de la configuración de Mailgun
      const requestDetails = {
        auth: `api:${key}`,
        protocol: protocol,
        host: host,
        method: 'POST',
        path: `/v3/${domainName}/messages`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(stringPayload),
        },
      }

      const req = https.request(requestDetails, function (res) {
        const status = res.statusCode

        if (status === 200 || status === 201) {
          callback(false)
        } else {
          console.log('Error en Mailgun')
          callback(`API Mailgun - Respuesta del servicio: ${status}`)
        }
      })

      req.on('error', function (errOn) {
        callback(`Se ha generado un error: ${errOn}`)
      })

      req.write(stringPayload)
      req.end()
    } else {
      callback(401, { error: `Error en los datos privados ${errRead}` })
    }
  })
}

lib.twilio = function (phone, msg, callback) {
  const stringPhone = typeof phone === 'string' && phone.trim().length === 10 ? phone.trim() : false
  const stringMessage = typeof msg === 'string' && msg.trim().length > 0 && msg.trim().length < 1600 ? phone.trim() : false
  if (stringPhone && stringMessage) {
    data.read('private', 'api-keys', function (errRead, keys) {
      if (!errRead && keys) {
        const payload = {
          From: keys.twilio.from,
          To: `+52${stringPhone}`,
          Body: stringMessage,
        }
        const stringPayload = querystring.stringify(payload)
        const requestDetails = {
          protocol: keys.twilio.protocol,
          hostname: keys.twilio.host,
          method: 'POST',
          path: `/2010-04-01/Accounts/${keys.twilio.sid}/Messages.json`,
          auth: `${keys.twilio.sid}:${keys.twilio.secretKey}`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(stringPayload),
          },
        }

        const req = https.request(requestDetails, function (res) {
          const status = res.statusCode

          if (status === 200 || status === 201) {
            callback(false)
          } else {
            console.log('Error en Twilio')
            callback(`API Twilio - Respuesta del servicio: ${status}`)
          }
        })

        req.on('error', function (errOn) {
          callback(`Se ha generado un error: ${errOn}`)
        })

        req.write(stringPayload)
        req.end()
      }
    })
  } else {
    callback('Los parámetros proporcionados no son correctos')
  }
}

/**
 * Función para obtener las traducciones del array i18n
 * @param key
 * @param lang
 * @returns {*}
 */
lib.translate = function (key, lang) {
  let requestLang = lang
  if (lang === undefined) {
    requestLang = 'es'
  }
  const loadLang = require(`./../langs/${requestLang}`)
  const translate = loadLang[key]
  if (translate === undefined) {
    return key
  }
  return translate
}

module.exports = lib
