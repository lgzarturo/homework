/**
 * Configuración de la aplicación
 */

// Entornos
var enviroments = {};

// Staging (default) - Desarrollo
enviroments.staging = {
	'httpPort' : 3000,
	'httpsPort' : 3001,
	'envName' : 'staging',
	'hashingSecret' : '08c1c0dae1dab39f5db54f286b5a75ae',
};

// Production - Productivo
enviroments.production = {
	'httpPort' : 5000,
	'httpsPort' : 5001,
	'envName' : 'production',
	'hashingSecret' : 'ad97c097cb5e3fe5baeeffcd67b6cedc',
};

var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

var environmentToExport = typeof(enviroments[currentEnvironment]) == 'object' ? enviroments[currentEnvironment] : enviroments.staging;

module.exports = environmentToExport;