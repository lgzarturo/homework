/**
 * Funciones para validar los objetos request y response de la aplicación
 */

const config = require('../config/config')

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

validators.isValidPhoneField = (value) => {
  return typeof value === 'string' && value.trim().length <= 16 && value.trim().startsWith('+') ? value.trim() : false
}

validators.isValidTextFieldSize = (value, size = 0) => {
  if (size === 0) {
    return validators.isValidTextField(value)
  }
  return typeof value === 'string' && value.trim().length === size ? value.trim() : false
}

validators.isValidEmailField = (value) => validators.isValidTextField(value)

validators.isValidPasswordField = (value) => validators.isValidTextField(value)

validators.isValidTokenField = (value) => {
  return typeof value === 'string' && value.trim().length === config.tokenSize ? value.trim() : false
}

validators.isValidBooleanField = (value) => {
  return typeof value === 'boolean' ? value : false
}

validators.isValidNumberField = (value) => {
  return typeof value === 'number' && value > 0 ? value : false
}

validators.isValidMonthOfYear = (value) => {
  return typeof value === 'number' && value >= 1 && value <= 12 ? value : false
}

validators.isValidYear = (value) => {
  return typeof value === 'number' && value >= 2015 ? value : false
}

validators.isValidCardCvv = (value) => {
  return typeof value === 'string' && value.trim().length >= 3 && value.trim().length <= 4 ? value : false
}

validators.isValidCardNumber = (value) => {
  return typeof value === 'string' && value.trim().length === 16 ? value : false
}

validators.isValidTimeInSeconds = (value) => {
  return typeof value === 'number' && value % 1 === 0 && value >= 1 && value <= 5 ? value : false
}

validators.isValidArrayObject = (value) => {
  return typeof value === 'object' && value instanceof Array && value.length > 0 ? value : false
}

validators.isValidMethodValue = (value) => {
  return validators._isValidValueInArray(value, ['get', 'post', 'put', 'delete'])
}

validators.isValidProtocolValue = (value) => {
  return validators._isValidValueInArray(value, ['http', 'https'])
}

validators._isValidValueInArray = (value, options) => {
  if (options === undefined) {
    return false
  }
  return typeof value === 'string' && options.indexOf(value) !== -1 ? value : false
}

module.exports = validators
