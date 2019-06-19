/**
 * General API
 */

// Dependencias de la aplicación
let _server = require('./lib/server');

let app = {};

// Inicializar
app.init = function () {
    // Ejecuta el servidor
    _server.init();
};

app.init();

module.exports = app;
