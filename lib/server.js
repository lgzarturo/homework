/**
 * Servidor 
 */

// Dependencias
var fs = require('fs');
var http = require('http');
var https = require('https');
var path = require('path');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

// Dependencias de la aplicación
var _config = require('./../config/config');
var _helpers = require('./helpers');
var _homework1 = require('./../handlers/homework1');
var _homework2 = require('./../handlers/homework2');
var _users = require('./../handlers/homework2-users');

var lib = {};

// Iniciando el servidor HTTP
lib.httpServer = http.createServer(function (req, res) {
	lib.unifiedServer(req, res);
});

// Iniciando el servidor HTTPS
lib.httpsServerOptions = {
	'key' : fs.readFileSync(path.join(__dirname, '/../.https/key.pem')),
	'cert' : fs.readFileSync(path.join(__dirname, '/../.https/cert.pem'))
};

lib.httpsServer = https.createServer(lib.httpsServerOptions, function (req, res) {
	lib.unifiedServer(req, res);
});

// Logica aplicada para los servidores HTTP y HTTPS
lib.unifiedServer = function (req, res) {
	var parseUrl = url.parse(req.url, true);
  var path = parseUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g, '');
	var queryStringObject = parseUrl.query;
	var method = req.method.toLowerCase();
	var headers = req.headers;
	var decoder = new StringDecoder('utf-8');
	var buffer = '';
	
	req.on('data', function (data) {
		buffer += decoder.write(data);
	});

	req.on('end', function () {
		buffer += decoder.end();
    
		var chooseHandler = typeof(lib.router[trimmedPath]) !== 'undefined' ? lib.router[trimmedPath] : _homework1.notFound;
    
		var data = {
			'trimmedPath' : trimmedPath,
			'queryStringObject' : queryStringObject,
			'method' : method,
			'headers' : headers,
			'payload' : _helpers.parseJsonToObject(buffer)
		};
    
		chooseHandler(data, function (statusCode, payload) {
      
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      var debugColor = (statusCode == 200) ? '\x1b[32m%s\x1b[0m' : '\x1b[31m%s\x1b[0m';
      
      res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
      res.end(JSON.stringify(typeof(payload) == 'object' ? payload : {}));

      console.log(debugColor, new Date(),trimmedPath, method, statusCode);
		});

	});
};

// Define las solicitudes del API
lib.router = {
  'hello' : _homework1.hello,
	'pizza' : _homework2.pizza,
	'users' : _users.users,
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