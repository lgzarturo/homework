/**
 * Servidor
 */

// Dependencias
const fs = require('fs');
// @ignore
const http = require('http');
// @ignore
const https = require('https');
// @ignore
const path = require('path');
// @ignore
const url = require('url');
// @ignore
const { StringDecoder } = require('string_decoder');

// Dependencias libs
const config = require('./../config/config');
// @ignore
const helpers = require('./helpers');
// @ignore
const homework1 = require('./../handlers/homework1');
// @ignore
const homework2 = require('./../handlers/homework2');
// @ignore
const menu = require('./../handlers/homework2-menu');
// @ignore
const users = require('./../handlers/homework2-users');
// @ignore
const checks = require('./../handlers/homework2-checks');
// @ignore
const shopping = require('./../handlers/homework2-shopping-cart');
// @ignore
const tokens = require('./../handlers/homework2-tokens');
// @ignore
const orders = require('./../handlers/homework2-orders');

// @ignore
const lib = {};

/**
 * Opciones para el servidor http
 */
lib.httpServer = http.createServer(function(req, res) {
  lib.unifiedServer(req, res);
});

/**
 * Opciones para el servidor https
 * @type {{cert: *, key: *}}
 */
lib.httpsServerOptions = {
  key: fs.readFileSync(path.join(__dirname, '/../.https/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '/../.https/cert.pem'))
};

/**
 * Iniciar el puerto y activar el servidor
 */
lib.httpsServer = https.createServer(lib.httpsServerOptions, function(req, res) {
  lib.unifiedServer(req, res);
});

/**
 * Logica aplicada para los servidores HTTP y HTTPS
 * @param req
 * @param res
 */
lib.unifiedServer = function(req, res) {
  const parseUrl = url.URL(req.url, true);
  const pathName = parseUrl.pathname;
  const trimmedPath = pathName.replace(/^\/+|\/+$/g, '');
  const queryStringObject = parseUrl.query;
  const method = req.method.toLowerCase();
  const { headers } = req;
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data', function(data) {
    buffer += decoder.write(data);
  });

  req.on('end', function() {
    buffer += decoder.end();

    const chooseHandler = typeof lib.router[trimmedPath] !== 'undefined' ? lib.router[trimmedPath] : homework1.notFound;

    const data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      lang: headers['accept-language'],
      payload: helpers.parseJsonToObject(buffer)
    };

    chooseHandler(data, function(statusCode, payload) {
      const responseStatusCode = typeof statusCode === 'number' ? statusCode : 200;
      const debugColor = statusCode === 200 ? '\x1b[32m%s\x1b[0m' : '\x1b[31m%s\x1b[0m';

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(responseStatusCode);
      res.end(JSON.stringify(typeof payload === 'object' ? payload : {}));

      console.log(debugColor, new Date(), trimmedPath, method, statusCode);
    });
  });
};

/**
 * Define las solicitudes del API
 * @type {{"shopping-cart": ((function(*=, *=): void)|*), pizza: ((function(*=, *): void)|*), payments: ((function(*=, *=): void)|*), tokens: ((function(*=, *=): void)|*), hello: ((function(*=, *): void)|*), menu: ((function(*=, *=): void)|*), users: ((function(*=, *=): void)|*)}}
 */
lib.router = {
  ping: homework1.ping,
  hello: homework1.hello,
  pizza: homework2.pizza,
  'api/users': users.users,
  'api/tokens': tokens.tokens,
  'api/checks': checks.checks,
  'api/menu': menu.items,
  'api/shopping-cart': shopping.cart,
  'api/payments': orders.payments
};

/**
 * Funcion para iniciar los servidores http y https
 */
lib.init = function() {
  // Iniciamos el servidor HTTP
  lib.httpServer.listen(config.httpPort, function() {
    console.log('\x1b[36m%s\x1b[0m', `The server HTTP is listening on port ${config.httpPort} in [${config.envName}] mode`);
  });

  // Iniciamos el servidor HTTPS
  lib.httpsServer.listen(config.httpsPort, function() {
    console.log('\x1b[35m%s\x1b[0m', `The server HTTPS is listening on port ${config.httpsPort} in [${config.envName}] mode`);
  });
};

// @ignore
module.exports = lib;
