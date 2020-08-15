/**
 * Funciones para validar los objetos request y response de la aplicación
 */

// Controlador dependiendo la solicitud URI
const validators = {}

validators.isValidMethod = (method, acceptableMethods = ['post', 'get', 'put', 'delete']) => {
  return acceptableMethods.indexOf(method) !== -1
}

validators.isValidProtocol = (protocol, acceptableProtocols = ['http', 'https']) => {
  return acceptableProtocols.indexOf(protocol) !== -1
}

validators.isValidTextField = (value, canBeBlank = false) => {
  if (canBeBlank) {
    return typeof value === 'string' ? value.trim() : false
  }
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : false
}

validators.isValidEmailField = (value) => validators.isValidTextField(value)

validators.isValidPasswordField = (value) => validators.isValidTextField(value)

module.exports = validators
