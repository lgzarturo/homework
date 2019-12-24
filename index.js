/**
 * General API
 */

// Dependencias libs
const server = require('./lib/server');

// Applicación
const app = {};

// Inicializar
app.init = function() {
  // Ejecuta el servidor
  server.init();
};

// Iniciar la aplicación
app.init();

// @ignore
module.exports = app;
