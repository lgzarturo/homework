/**
 * General API
 */

// Dependencias libs
const server = require('./lib/server')
const workers = require('./lib/workers')

// Aplicación
const app = {}

// Inicializar
app.init = function () {
  // Ejecuta el servidor
  server.init()
  workers.init()
}

// Iniciar la aplicación
app.init()

// @ignore
module.exports = app
