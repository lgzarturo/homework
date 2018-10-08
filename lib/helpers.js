/**
 * Tareas de ayuda
 */

// Dependencias
var crypto = require('crypto');
var https = require('https');
var querystring = require('querystring');

// Dependencias de la aplicación
var _config = require('./../config/config');

var helpers = {};

// Encriptando con el hash SHA256
helpers.hash = function (str) {
	if (typeof(str) == 'string' && str.length > 0) {
		return crypto.createHmac('sha256', _config.hashingSecret).update(str).digest('hex');
  } 
  return false;
};

// Convertimos la cadena de JSON en un objeto
helpers.parseJsonToObject = function (str) {
	try{
		return JSON.parse(str);
	} catch (e) {
		return {};
	}
};

// Creación de cadenas aleatorias
helpers.createRandomString = function (strLength) {
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

module.exports = helpers;