/**
 * General API
 */

// Dependencias libs
const server = require('./lib/server')
const workers = require('./lib/workers')
const cli = require('./lib/cli')

// Aplicación
const app = {}

// Inicializar
app.init = function () {
  // Ejecuta el servidor
  server.init()
  workers.init()
  setTimeout(() => {
    cli.init()
  }, 50)
}

// Iniciar la aplicación
app.init()

// @ignore
module.exports = app
