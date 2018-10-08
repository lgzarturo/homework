/**
 * General API
 */

// Dependencias de la aplicación
var _server = require('./lib/server');

var app = {};

// Inicializar
app.init = function () {
	// Ejecuta el servidor
	_server.init();

};

app.init();

module.exports = app;