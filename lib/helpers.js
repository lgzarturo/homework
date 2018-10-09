/**
 * Tareas de ayuda
 */

// Dependencias
var crypto = require('crypto');

// Dependencias de la aplicación
var _config = require('./../config/config');

var lib = {};

// Encriptando con el hash SHA256
lib.hash = function (str) {
  if (typeof(str) == 'string' && str.length > 0) {
    return crypto.createHmac('sha256', _config.hashingSecret).update(str).digest('hex');
  } 
  return false;
};

// Convertimos la cadena de JSON en un objeto
lib.parseJsonToObject = function (str) {
  try{
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
};

// Creación de cadenas aleatorias
lib.createRandomString = function (strLength) {
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if (strLength) {
    var posibleCharacters = 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0_=+¡#&%-0123456789.';
    var str = '';
    for (var i = 1; i <= strLength; i++) {
      var randomCharacter = posibleCharacters.charAt(Math.floor(Math.random() * posibleCharacters.length));
      str += randomCharacter;
    }
    return str;
  } 
  return false;
};

module.exports = lib;