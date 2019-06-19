/**
 * Logs
 */

// Dependencias
let fs = require('fs');
let path = require('path');
let zlib = require('zlib');

let lib = {};

// Define el directorio base
lib.baseDir = path.join(__dirname, '/../.logs/');

// Agrega una cadena al archivo, crear el archivo si no existe
lib.append = function (file, str, callback) {
    fs.open(`${lib.baseDir}${file}.log`, 'a', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {
            fs.appendFile(fileDescriptor, `${str}\n`, function (err) {
                if (!err) {
                    fs.close(fileDescriptor, function (err) {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error al cerrar el archivo.');
                        }
                    });
                } else {
                    callback('Error al escribir en el archivo.');
                }
            });
        } else {
            callback('No se puede abrir el archivo.');
        }
    });
};

// Listado de todos los archivos del log
lib.list = function (includeCompressLogs, callback) {
    fs.readdir(lib.baseDir, function (err, data) {
        if (!err && data && data.length > 0) {
            let trimmedFileNames = [];
            data.forEach(function (fileName) {
                if (fileName.indexOf('.log') > -1) {
                    trimmedFileNames.push(fileName.replace('.log', ''));
                }

                if (fileName.indexOf('.gz.b64') > -1 && includeCompressLogs) {
                    trimmedFileNames.push(fileName.replace('.log', ''));
                }
            });
            callback(false, trimmedFileNames);
        } else {
            callback(err, data);
        }
    });
};

// Comprimir el contenido de archivo
lib.compress = function (logId, newFile, callback) {
    let sourceFile = `${logId}.log`;
    let desFile = `${newFile}.gz.b64`;
    fs.readFile(`${lib.baseDir}${sourceFile}`, 'utf8', function (err, inputString) {
        if (!err && inputString) {
            zlib.gzip(inputString, function (err, buffer) {
                if (!err && buffer) {
                    // Enviar la informacion al archivo destino
                    fs.open(`${lib.baseDir}${desFile}`, 'wx', function (err, fileDescriptor) {
                        if (!err && fileDescriptor) {
                            fs.writeFile(fileDescriptor, buffer.toString('base64'), function (err) {
                                if (!err) {
                                    fs.close(fileDescriptor, function (err) {
                                        if (!err) {
                                            callback(false);
                                        } else {
                                            callback(err);
                                        }
                                    });
                                } else {
                                    callback(err);
                                }
                            });
                        } else {
                            callback(err);
                        }
                    });
                } else {
                    callback(err);
                }
            });
        } else {
            callback(err);
        }
    });
};

// Descomprimir el contenido del archivo gz.b64 dentro de una cadena
lib.decompress = function (fileId, callback) {
    let fileName = `${fileId}.gz.b64`;
    fs.readFile(`${lib.baseDir}${fileName}`, 'utf-8', function (err, str) {
        if (!err && str) {
            let inputBuffer = Buffer.from(str, 'base64');
            zlib.unzip(inputBuffer, function (err, outputBuffer) {
                if (!err && outputBuffer) {
                    let str = outputBuffer.toString();
                    callback(false, str);
                } else {
                    callback(err);
                }
            });
        } else {
            callback(err);
        }
    });
};

// Truncar el archivo log
lib.truncate = function (logId, callback) {
    fs.truncate(`${lib.baseDir}${logId}.log`, 0, function (err) {
        if (!err) {
            callback(false);
        } else {
            callback(err);
        }
    });
};

module.exports = lib;
