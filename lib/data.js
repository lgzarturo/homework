/**
 * Library for storing and editing data
 */

// Dependencias
const fs = require('fs')
const path = require('path')

const lib = {}

// Define el directorio base para los datos
lib.baseDir = path.join(__dirname, '/../.data/')

/**
 * Escribir datos en el archivo
 * @param dir
 * @param file
 * @param data
 * @param callback
 */
lib.create = function (dir, file, data, callback) {
  // Abrir el archivo para lectura
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', function (err, fileDescriptor) {
    if (!err && fileDescriptor) {
      const stringData = JSON.stringify(data)

      // Escribir en el archivo y cerrarlo
      fs.writeFile(fileDescriptor, stringData, function (errWriteFile) {
        if (!errWriteFile) {
          fs.close(fileDescriptor, function (errClose) {
            if (!errClose) {
              callback(false)
            } else {
              callback('Error al cerrar el nuevo archivo.')
            }
          })
        } else {
          callback('Error al escribir en el nuevo archivo.')
        }
      })
    } else {
      callback('No se puede crear el archivo, el archivo ya existe.')
    }
  })
}

/**
 * Leer la información del archivo
 * @param dir
 * @param file
 * @param callback
 */
lib.read = function (dir, file, callback) {
  fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf-8', function (err, data) {
    if (!err && data) {
      let object = {}

      try {
        object = JSON.parse(data)
      } catch (e) {
        console.log(`${lib.baseDir}${dir}/${file}.json`)
        console.log('data.read -> Error al intentar parsear la información del archivo')
        console.log(e)
      }
      callback(false, object)
    } else {
      callback(err, data)
    }
  })
}

/**
 * Actualizar información del archivo
 * @param dir
 * @param file
 * @param data
 * @param callback
 */
lib.update = function (dir, file, data, callback) {
  // Abrir el archivo para escritura
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', function (err, fileDescriptor) {
    if (!err && fileDescriptor) {
      const stringData = JSON.stringify(data)

      // Truncar el archivo
      fs.ftruncate(fileDescriptor, function (errTruncate) {
        if (!errTruncate) {
          fs.writeFile(fileDescriptor, stringData, function (errWriteFile) {
            if (!errWriteFile) {
              fs.close(fileDescriptor, function (errClose) {
                if (!errClose) {
                  callback(false)
                } else {
                  callback('Error al cerrar el nuevo archivo.')
                }
              })
            } else {
              callback('Error al escribir en el archivo.')
            }
          })
        } else {
          callback('Error al truncar el archivo.')
        }
      })
    } else {
      console.log(`${lib.baseDir}${dir}/${file}.json`)
      callback('No se puede actualizar el archivo.')
    }
  })
}

/**
 * Eliminar el archivo
 * @param dir
 * @param file
 * @param callback
 */
lib.delete = function (dir, file, callback) {
  fs.unlink(`${lib.baseDir}${dir}/${file}.json`, function (err) {
    if (!err) {
      callback(false)
    } else {
      callback('Error al intentar borrar el archivo')
    }
  })
}

/**
 * Listar todos los archivos del directorio
 * @param dir
 * @param callback
 */
lib.list = function (dir, callback) {
  fs.readdir(`${lib.baseDir}${dir}/`, function (err, data) {
    if (!err && data && data.length > 0) {
      const trimmedFileNames = []
      data.forEach(function (fileName) {
        trimmedFileNames.push(fileName.replace('.json', ''))
      })
      callback(false, trimmedFileNames)
    } else {
      callback(err, data)
    }
  })
}

/**
 * Listar todos los archivos del directorio
 * @param dir
 * @param callback
 */
lib.listAndRead = function (dir, callback) {
  fs.readdir(`${lib.baseDir}${dir}/`, function (err, data) {
    if (!err && data && data.length > 0) {
      const dataObjects = []

      data.forEach(function (fileName) {
        if (!fileName.includes('.md')) {
          const contents = fs.readFileSync(`${lib.baseDir}${dir}/${fileName}`)
          const jsonContent = JSON.parse(contents)
          dataObjects.push(jsonContent)
        }
      })
      callback(false, dataObjects)
    } else {
      callback(err, data)
    }
  })
}

module.exports = lib
