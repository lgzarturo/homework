/**
 * Servidor
 */

// Dependencias
const fs = require('fs')
const http = require('http')
const https = require('https')
const path = require('path')
const url = require('url')
const querystring = require('querystring')
const { StringDecoder } = require('string_decoder')
// Dependencias libs
const config = require('../config/config')
const helpers = require('./helpers')
const homework1 = require('../handlers/homework1')
const homework2 = require('../handlers/homework2')
const menu = require('../handlers/homework2-menu')
const users = require('../handlers/homework2-users')
const checks = require('../handlers/homework2-checks')
const shopping = require('../handlers/homework2-shopping-cart')
const tokens = require('../handlers/homework2-tokens')
const orders = require('../handlers/homework2-orders')
const notification = require('../handlers/homework2-notification')
const pages = require('../handlers/pages')
const accounts = require('../handlers/accounts')
const sessions = require('../handlers/sessions')
const webChecks = require('../handlers/web-checks')

const lib = {}

/**
 * Opciones para el servidor http
 */
lib.httpServer = http.createServer(function (req, res) {
  lib.unifiedServer(req, res)
})

/**
 * Opciones para el servidor https
 * @type {{cert: *, key: *}}
 */
lib.httpsServerOptions = {
  key: fs.readFileSync(path.join(__dirname, '/../.https/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '/../.https/cert.pem')),
}

/**
 * Iniciar el puerto y activar el servidor
 */
lib.httpsServer = https.createServer(lib.httpsServerOptions, function (req, res) {
  lib.unifiedServer(req, res)
})

/**
 * Lógica aplicada para los servidores HTTP y HTTPS
 * @param req
 * @param res
 */
lib.unifiedServer = (req, res) => {
  const parseUrl = url.parse(req.url)
  const pathName = parseUrl.pathname
  const trimmedPath = pathName.replace(/^\/+|\/+$/g, '')
  const queryStringObject = querystring.parse(parseUrl.query)
  const method = req.method.toLowerCase()
  const { headers } = req
  const decoder = new StringDecoder('utf-8')
  const lang = headers['accept-language'] !== undefined ? headers['accept-language'] : 'es-mx'
  let buffer = ''

  req.on('data', (data) => {
    buffer += decoder.write(data)
  })

  req.on('end', () => {
    buffer += decoder.end()

    let chooseHandler = typeof lib.router[trimmedPath] !== 'undefined' ? lib.router[trimmedPath] : homework1.notFound

    chooseHandler = trimmedPath.indexOf('public/') !== -1 ? pages.public : chooseHandler

    const data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      lang: lang,
      payload: helpers.parseJsonToObject(buffer),
    }

    chooseHandler(data, (statusCode, payload, contentType) => {
      const type = typeof contentType === 'string' ? contentType : 'json'
      let responseStatusCode = typeof statusCode === 'number' ? statusCode : 200
      let responsePayload = ''
      let responseContentType = 'text/plain'
      const debugColor = statusCode === 200 ? '\x1b[32m%s\x1b[0m' : '\x1b[31m%s\x1b[0m'

      if (type === 'json') {
        responseContentType = 'application/json'
        responsePayload = JSON.stringify(typeof payload === 'object' ? payload : {})
      } else if (type === 'html') {
        responseContentType = 'text/html'
        responsePayload = typeof payload === 'string' ? payload : ''
      } else if (type === 'js') {
        responseContentType = 'text/javascript'
        responsePayload = typeof payload !== 'undefined' ? payload : ''
      } else if (type === 'favicon') {
        responseContentType = 'image/x-icon'
        responsePayload = typeof payload !== 'undefined' ? payload : ''
      } else if (type === 'css') {
        responseContentType = 'text/css'
        responsePayload = typeof payload !== 'undefined' ? payload : ''
      } else if (type === 'png') {
        responseContentType = 'image/png'
        responsePayload = typeof payload !== 'undefined' ? payload : ''
      } else if (type === 'jpg') {
        responseContentType = 'image/jpeg'
        responsePayload = typeof payload !== 'undefined' ? payload : ''
      } else {
        responseStatusCode = 204
      }

      res.setHeader('Content-Type', responseContentType)
      res.writeHead(responseStatusCode)
      res.end(responsePayload)

      console.log(debugColor, new Date(), trimmedPath, method, statusCode)
    })
  })
}

/**
 * Define las solicitudes del API
 * @type {{"shopping-cart": ((function(*=, *=): void)|*), pizza: ((function(*=, *): void)|*), payments: ((function(*=, *=): void)|*), tokens: ((function(*=, *=): void)|*), hello: ((function(*=, *): void)|*), menu: ((function(*=, *=): void)|*), users: ((function(*=, *=): void)|*)}}
 */
lib.router = {
  '': pages.index,
  favicon: pages.favicon,
  'public/': pages.public,
  'account/create': accounts.create,
  'account/edit': accounts.edit,
  'account/delete': accounts.delete,
  'session/create': sessions.create,
  'session/edit': sessions.edit,
  'session/delete': sessions.delete,
  'checks/create': webChecks.create,
  ping: homework1.ping,
  hello: homework1.hello,
  pizza: homework2.pizza,
  'api/users': users.users,
  'api/tokens': tokens.tokens,
  'api/checks': checks.checks,
  'api/menu': menu.items,
  'api/shopping-cart': shopping.cart,
  'api/payments': orders.payments,
  'api/sms': notification.sms,
}

/**
 * Función para iniciar los servidores http y https
 */
lib.init = () => {
  // Iniciamos el servidor HTTP
  lib.httpServer.listen(config.httpPort, function () {
    console.log('\x1b[36m%s\x1b[0m', `The server HTTP is listening on port ${config.httpPort} in [${config.envName}] mode`)
  })

  // Iniciamos el servidor HTTPS
  lib.httpsServer.listen(config.httpsPort, function () {
    console.log('\x1b[35m%s\x1b[0m', `The server HTTPS is listening on port ${config.httpsPort} in [${config.envName}] mode`)
  })
}

module.exports = lib
