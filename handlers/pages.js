/**
 * Homework 3
 * Controller para las páginas estáticas
 */

// Dependencias libs
const helpers = require('../lib/helpers')
// Controlador dependiendo la solicitud URI
const handlers = {}

/**
 * URI /index - Muestra la página de inicio
 * @param req
 * @param callback
 */
handlers.index = (req, callback) => {
  if (req.method !== 'get') {
    callback(405, undefined, 'html')
  } else {
    const data = {
      'head.title': 'Titulo del index',
      'head.description': 'Aquí hay una descripción para el index',
      'body.title': 'Pagina de inicio',
      'body.class': 'index',
    }

    helpers.getTemplate('pages/index', data, (err, str) => {
      if (!err && str) {
        helpers.applyLayout(str, data, (errLayout, content) => {
          if (!errLayout && content) {
            callback(200, content, 'html')
          } else {
            callback(500, undefined, 'html')
          }
        })
      } else {
        callback(404, undefined, 'html')
      }
    })
  }
}

module.exports = handlers
