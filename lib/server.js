/**
 * Servidor
 */

// Dependencias
let fs = require('fs');
let http = require('http');
let https = require('https');
let path = require('path');
let url = require('url');
let StringDecoder = require('string_decoder').StringDecoder;

// Dependencias de la aplicación
let _config = require('./../config/config');
let _helpers = require('./helpers');
let _homework1 = require('./../handlers/homework1');
let _homework2 = require('./../handlers/homework2');
let _menu = require('./../handlers/homework2-menu');
let _users = require('./../handlers/homework2-users');
let _shopping = require('./../handlers/homework2-shopping-cart');
let _tokens = require('./../handlers/homework2-tokens');
let _orders = require('./../handlers/homework2-orders');

let lib = {};

// Iniciando el servidor HTTP
lib.httpServer = http.createServer(function (req, res) {
    lib.unifiedServer(req, res);
});

// Iniciando el servidor HTTPS
lib.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '/../.https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../.https/cert.pem'))
};

lib.httpsServer = https.createServer(lib.httpsServerOptions, function (req, res) {
    lib.unifiedServer(req, res);
});

// Logica aplicada para los servidores HTTP y HTTPS
lib.unifiedServer = function (req, res) {
    let parseUrl = url.parse(req.url, true);
    let path = parseUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');
    let queryStringObject = parseUrl.query;
    let method = req.method.toLowerCase();
    let headers = req.headers;
    let decoder = new StringDecoder('utf-8');
    let buffer = '';

    req.on('data', function (data) {
        buffer += decoder.write(data);
    });

    req.on('end', function () {
        buffer += decoder.end();

        let chooseHandler = typeof (lib.router[trimmedPath]) !== 'undefined' ? lib.router[trimmedPath] : _homework1.notFound;

        let data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': _helpers.parseJsonToObject(buffer)
        };

        chooseHandler(data, function (statusCode, payload) {

            statusCode = typeof (statusCode) === 'number' ? statusCode : 200;
            let debugColor = (statusCode === 200) ? '\x1b[32m%s\x1b[0m' : '\x1b[31m%s\x1b[0m';

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(JSON.stringify(typeof (payload) === 'object' ? payload : {}));

            console.log(debugColor, new Date(), trimmedPath, method, statusCode);
        });

    });
};

// Define las solicitudes del API
lib.router = {
    'hello': _homework1.hello,
    'pizza': _homework2.pizza,
    'users': _users.users,
    'tokens': _tokens.tokens,
    'menu': _menu.items,
    'shopping-cart': _shopping.cart,
    'payments': _orders.payments,
};

lib.init = function () {
    // Iniciamos el servidor HTTP
    lib.httpServer.listen(_config.httpPort, function () {
        console.log('\x1b[36m%s\x1b[0m', `The server HTTP is listening on port ${_config.httpPort} in [${_config.envName}] mode`);
    });

    // Iniciamos el servidor HTTPS
    lib.httpsServer.listen(_config.httpsPort, function () {
        console.log('\x1b[35m%s\x1b[0m', `The server HTTPS is listening on port ${_config.httpsPort} in [${_config.envName}] mode`);
    });

};

module.exports = lib;
