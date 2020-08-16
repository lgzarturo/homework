/**
 * Funciones para validar los objetos request y response de la aplicación
 */

// Controlador dependiendo la solicitud URI
const cleaners = {}

cleaners.getValidArrayObject = (value) => {
  return typeof value === 'object' && value instanceof Array && value.length > 0 ? value : []
}

module.exports = cleaners
