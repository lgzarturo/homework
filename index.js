/**
 * General API
 */

// Dependencias libs
let _server = require('./lib/server');

// Applicación
let app = {};

// Inicializar
app.init = function () {
    // Ejecuta el servidor
    _server.init();
};

// Iniciar la aplicación
app.init();

// @ignore
module.exports = app;
