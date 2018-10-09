/**
 * Library for storing and editing data
 */

// Dependencias
var fs = require('fs');
var path = require('path');

// Dependencias de la aplicación
var _helpers = require('./helpers');

var lib = {};

// Define el directorio base para los datos
lib.baseDir = path.join(__dirname, '/../.data/');

// Escribir datos en el archivo
lib.create = function (dir, file, data, callback) {
	// Abrir el archivo para lectura
	fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', function (err, fileDescriptor) {
		if (!err && fileDescriptor) {
			var stringData = JSON.stringify(data);

			// Escribir en el archivo y cerrarlo
			fs.writeFile(fileDescriptor, stringData, function (err) {
				if (!err) {
					fs.close(fileDescriptor, function (err) {
						if (!err) {
							callback(false);
						} else {
							callback('Error al cerrar el nuevo archivo.');
						}
					});
				} else {
					callback('Error al escribir en el nuevo archivo.');
				}
			});
		} else {
			callback('No se puede crear el archivo, el archivo ya existe.');
		}
	});
};

// Leer la información del archivo
lib.read = function (dir, file, callback) {
	fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf-8', function (err, data) {
		if (!err && data) {
			var parseData = _helpers.parseJsonToObject(data);			
			callback(false, parseData);
		} else {
			callback(err, data);
		}
	}); 
};

// Actualizar información del archivo
lib.update = function (dir, file, data, callback) {
	// Abrir el archivo para escritura
	fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', function (err, fileDescriptor) {
		if (!err && fileDescriptor) {
			var stringData = JSON.stringify(data);

			// Truncar el archivo
			fs.truncate(fileDescriptor, function (err) {
				if (!err) {
					fs.writeFile(fileDescriptor, stringData, function (err) {
						if (!err) {
							fs.close(fileDescriptor, function (err) {
								if (!err) {
									callback(false);
								} else {
									callback('Error al cerrar el nuevo archivo.');
								}
							});
						} else {
							callback('Error al escribir en el archivo.');
						}
					});
				} else {
					callback('Error al truncar el archivo.');
				}
			});
		} else {
			callback('No se puede actualizar el archivo.');
		}

	});
};

// Eliminar el archivo
lib.delete =  function (dir, file, callback) {
	fs.unlink(`${lib.baseDir}${dir}/${file}.json`, function (err) {
		if (!err) {
			callback(false);
		} else {
			callback('Error al intentar borrar el archivo');
		}
	});
};

// Listar todos los archivos del directorio
lib.list = function (dir, callback) {
	fs.readdir(`${lib.baseDir}${dir}/`, function (err, data) {
		if (!err && data && data.length > 0) {
			var trimmedFileNames = [];
			data.forEach(function (fileName) {
				trimmedFileNames.push(fileName.replace('.json', ''));
			}); 
			callback(false, trimmedFileNames);
		} else {
			callback(err, data);
		}
	});
};

module.exports = lib;