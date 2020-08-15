/**
 * Logs
 */

// Dependencias
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const lib = {}

// Define el directorio base
lib.baseDir = path.join(__dirname, '/../.logs/')

/**
 * Agrega una cadena al archivo, crear el archivo si no existe
 * @param file
 * @param str
 * @param callback
 */
lib.append = function (file, str, callback) {
  fs.open(`${lib.baseDir}${file}.log`, 'a', function (errOpen, fileDescriptor) {
    if (!errOpen && fileDescriptor) {
      fs.appendFile(fileDescriptor, `${str}\n`, function (errAppendFile) {
        if (!errAppendFile) {
          fs.close(fileDescriptor, function (errClose) {
            if (!errClose) {
              callback(false)
            } else {
              callback('Error al cerrar el archivo.')
            }
          })
        } else {
          callback('Error al escribir en el archivo.')
        }
      })
    } else {
      callback('No se puede abrir el archivo.')
    }
  })
}

/**
 * Listado de todos los archivos del log
 * @param includeCompressLogs
 * @param callback
 */
lib.list = function (includeCompressLogs, callback) {
  fs.readdir(lib.baseDir, function (err, data) {
    if (!err && data && data.length > 0) {
      const trimmedFileNames = []
      data.forEach(function (fileName) {
        if (fileName.indexOf('.log') !== -1) {
          trimmedFileNames.push(fileName.replace('.log', ''))
        }

        if (fileName.indexOf('.gz.b64') !== -1 && includeCompressLogs) {
          trimmedFileNames.push(fileName.replace('.log', ''))
        }
      })
      callback(false, trimmedFileNames)
    } else {
      callback(err, data)
    }
  })
}

/**
 * Comprimir el contenido de archivo
 * @param logId
 * @param newFile
 * @param callback
 */
lib.compress = function (logId, newFile, callback) {
  const sourceFile = `${logId}.log`
  const desFile = `${newFile}.gz.b64`
  fs.readFile(`${lib.baseDir}${sourceFile}`, 'utf8', function (errReadFile, inputString) {
    if (!errReadFile && inputString) {
      zlib.gzip(inputString, function (errGzip, buffer) {
        if (!errGzip && buffer) {
          // Enviar la información al archivo destino
          fs.open(`${lib.baseDir}${desFile}`, 'wx', function (errOpen, fileDescriptor) {
            if (!errOpen && fileDescriptor) {
              fs.writeFile(fileDescriptor, buffer.toString('base64'), function (errWriteFile) {
                if (!errWriteFile) {
                  fs.close(fileDescriptor, function (errClose) {
                    if (!errClose) {
                      callback(false)
                    } else {
                      callback(errClose)
                    }
                  })
                } else {
                  callback(errWriteFile)
                }
              })
            } else {
              callback(errOpen)
            }
          })
        } else {
          callback(errGzip)
        }
      })
    } else {
      callback(errReadFile)
    }
  })
}

/**
 * Descomprimir el contenido del archivo gz.b64 dentro de una cadena
 * @param fileId
 * @param callback
 */
lib.decompress = function (fileId, callback) {
  const fileName = `${fileId}.gz.b64`
  fs.readFile(`${lib.baseDir}${fileName}`, 'utf-8', function (errReadFile, str) {
    if (!errReadFile && str) {
      const inputBuffer = Buffer.from(str, 'base64')
      zlib.unzip(inputBuffer, function (errUnzip, outputBuffer) {
        if (!errUnzip && outputBuffer) {
          callback(false, outputBuffer.toString())
        } else {
          callback(errUnzip)
        }
      })
    } else {
      callback(errReadFile)
    }
  })
}

/**
 * Truncar el archivo log
 * @param logId
 * @param callback
 */
lib.truncate = function (logId, callback) {
  fs.truncate(`${lib.baseDir}${logId}.log`, 0, function (errTruncate) {
    if (!errTruncate) {
      callback(false)
    } else {
      callback(errTruncate)
    }
  })
}

module.exports = lib
