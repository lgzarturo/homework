/**
 * CLI Tasks
 */

const readline = require('readline')
const util = require('util')
const debug = util.debug('cli')
const os = require('os')
const v8 = require('v8')
const events = require('events')
class _events extends events {}
const e = new _events()

const _data = require('./data')
const _logs = require('./logs')
const _helpers = require('./helpers')
const _cleaners = require('./../validation/request_clean')
const validators = require('../validation/request_validation')

const cli = {}

e.on('man', (str) => {
  cli.responders.help()
})

e.on('help', (str) => {
  cli.responders.help()
})

e.on('exit', (str) => {
  cli.responders.exit()
})

e.on('stats', (str) => {
  cli.responders.stats()
})

e.on('users', (str) => {
  cli.responders.users()
})

e.on('user', (str) => {
  cli.responders.user(str)
})

e.on('checks', (str) => {
  cli.responders.checks(str)
})

e.on('check', (str) => {
  cli.responders.check(str)
})

e.on('logs', (str) => {
  cli.responders.logs()
})

e.on('log', (str) => {
  cli.responders.log(str)
})

e.on('menu', (str) => {
  cli.responders.menu(str)
})

e.on('item', (str) => {
  cli.responders.item(str)
})

e.on('orders', (str) => {
  cli.responders.orders(str)
})

e.on('order', (str) => {
  cli.responders.order(str)
})

e.on('payments', (str) => {
  cli.responders.payments()
})

e.on('payment', (str) => {
  cli.responders.payment(str)
})

e.on('access', () => {
  console.log('this is a access action')
  cli.responders.access()
})

cli.responders = {}

cli.verticalSpace = (lines) => {
  lines = typeof lines === 'number' && lines > 0 ? lines : 1
  for (let index = 0; index < lines; index += 1) {
    console.log('')
  }
}

cli.horizontalLine = () => {
  const width = process.stdout.columns
  let line = ''
  for (let index = 0; index < width; index += 1) {
    line += '-'
  }
  console.log(line)
}

cli.centered = (str) => {
  str = typeof str === 'string' && str.trim().length > 0 ? str.trim() : ''
  const width = process.stdout.columns
  const leftPadding = Math.floor((width - str.length) / 2)
  let line = ''
  for (let index = 0; index < leftPadding; index += 1) {
    line += ' '
  }
  line += str
  console.log(line)
}

cli.responders.help = () => {
  const commands = {
    man: 'Show this help page',
    help: 'Alias of the "man" command',
    exit: 'Kill App',
    stats: 'Get statistics',
    users: 'Show list of the users',
    'user --{userId}': 'Details of the user',
    'checks --up --down': 'Show a list of the checks',
    'check --{checkId}': 'Details of the check',
    logs: 'Show a list of the log files',
    'log --{fileName}': 'Show details of the log file',
    menu: 'Show pizza menu',
    'item --{id}': 'Show item by id from menu',
    orders: 'Show list of the orders',
    'order --{orderId}': 'Show details of the order',
    payments: 'Show list of the payments',
    login: 'View all the users who have signed',
  }
  cli.horizontalLine()
  cli.centered('CLI MANUAL')
  cli.horizontalLine()
  cli.verticalSpace(2)

  for (let key in commands) {
    if (commands.hasOwnProperty(key)) {
      const value = commands[key]
      let line = `\x1b[33m${key}\x1b[0m`
      const padding = 60 - line.length
      for (let index = 0; index < padding; index += 1) {
        line += ' '
      }
      line += value
      console.log(line)
    }
  }
  cli.verticalSpace(1)
  cli.horizontalLine()
}

cli.responders.exit = () => {
  process.exit(0)
}

cli.responders.stats = () => {
  var stats = {
    'Load average': os.loadavg().join(' '),
    'CPU count': os.cpus().length,
    'Free memory': os.freemem(),
    'Current malloced memory': v8.getHeapStatistics().malloced_memory,
    'Peak malloced memory': v8.getHeapStatistics().peak_malloced_memory,
    'Allocared heap used (%)': Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
    'Available heap allocated (%)': Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
    Uptime: `${os.uptime()} seconds`,
  }

  cli.horizontalLine()
  cli.centered('SYSTEM STATISTICS')
  cli.horizontalLine()
  cli.verticalSpace(2)

  for (let key in stats) {
    if (stats.hasOwnProperty(key)) {
      const value = stats[key]
      let line = `\x1b[33m${key}\x1b[0m`
      const padding = 60 - line.length
      for (let index = 0; index < padding; index += 1) {
        line += ' '
      }
      line += value
      console.log(line)
    }
  }
  cli.verticalSpace(1)
  cli.horizontalLine()
}

cli.responders.users = () => {
  _data.list('users', (err, userIds) => {
    if (!err && userIds && userIds.length > 0) {
      cli.verticalSpace()
      userIds.forEach((userId) => {
        if (!userId.includes('.md')) {
          _data.read('users', userId, (errUser, userData) => {
            let line = `Name: ${userData.name} Email: ${userData.email} Phone: ${userData.phone} Checks: `
            let numberOfChecks = typeof userData.checks == 'object' && userData.checks instanceof Array && userData.checks.length > 0 ? userData.checks.length : 0
            line += numberOfChecks
            console.log(line)
          })
        }
      })
    }
  })
}

cli.responders.user = (str) => {
  const arr = str.split('--')
  const id = typeof arr[1] == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false
  if (id) {
    _data.read('users', id, (err, data) => {
      if (!err && data) {
        delete data.password
        cli.verticalSpace()
        console.dir(data, { color: true })
        cli.verticalSpace()
      }
    })
  }
}

cli.responders.checks = (str) => {
  _data.list('checks', (err, checkIds) => {
    if (!err && checkIds && checkIds.length > 0) {
      cli.verticalSpace()
      checkIds.forEach((checkId) => {
        if (!checkId.includes('.md')) {
          _data.read('checks', checkId, (errCheck, checkData) => {
            let includeCheck = false
            let lowerString = str.toLowerCase()
            let state = typeof checkData.state === 'string' ? checkData.state : 'down'
            let stateOrUnknown = typeof checkData.state === 'string' ? checkData.state : 'unkwnown'
            if (lowerString.indexOf(`--${state}`) !== -1 || (lowerString.indexOf('--down') === -1 && lowerString.indexOf('--up') === -1)) {
              let line = `ID ${checkData.id} ${checkData.method.toUpperCase()} ${checkData.protocol}://${checkData.url} State: ${stateOrUnknown}`
              console.log(line)
              cli.verticalSpace()
            }
          })
        }
      })
    }
  })
}

cli.responders.check = (str) => {
  console.log('You ask for a single Check', str)
  const arr = str.split('--')
  const id = typeof arr[1] == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false
  if (id) {
    _data.read('checks', id, (err, data) => {
      if (!err && data) {
        cli.verticalSpace()
        console.dir(data, { color: true })
        cli.verticalSpace()
      }
    })
  }
}

cli.responders.logs = () => {
  _logs.list(true, (err, logFileNames) => {
    if (!err && logFileNames && logFileNames.length > 0) {
      cli.verticalSpace()
      logFileNames.forEach((logFilename) => {
        if (logFilename.indexOf('-') != -1) {
          console.log(logFilename)
          cli.verticalSpace()
        }
      })
    }
  })
}

cli.responders.log = (str) => {
  const arr = str.split('--')
  const id = typeof arr[1] == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false
  if (id) {
    cli.verticalSpace()
    _logs.decompress(id, (err, strData) => {
      if (!err && strData) {
        let arr = strData.split('\n')
        arr.forEach((jsonString) => {
          let object = _helpers.parseJsonToObject(jsonString)
          if (object && JSON.stringify(object) !== '{}') {
            console.dir(object, { colors: true })
            cli.verticalSpace()
          }
        })
      }
    })
  }
}

cli.responders.menu = (str) => {
  _data.read('items', 'menu', (err, data) => {
    if (!err && data) {
      cli.verticalSpace()
      console.dir(data, { color: true })
      cli.verticalSpace()
    }
  })
}

cli.responders.item = (str) => {
  const arr = str.split('--')
  const id = typeof arr[1] == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false
  if (id) {
    cli.verticalSpace()
    _data.read('items', 'menu', (err, data) => {
      if (!err && data) {
        console.dir(data[id], { color: true })
      }
    })
  }
}

cli.responders.orders = () => {
  _data.list('orders', (err, listOrders) => {
    if (!err && listOrders) {
      listOrders.forEach((order) => {
        if (!order.includes('.md')) {
          _data.read('orders', order, (errOrder, orderData) => {
            cli.horizontalLine()
            cli.centered(`ORDER ${order}`)
            let quantityItems = 0
            let totalItems = 0
            const items = _cleaners.getValidArrayObject(orderData)
            console.log(`ORDER ITEMS:`)
            items.forEach((item) => {
              quantityItems += item.quantity
              const total = item.quantity * item.price
              totalItems += total
              console.log(`- ${item.name} | ${item.quantity} X $${item.price} = $${total}`)
            })
            cli.horizontalLine()
            console.log(`Number of items: ${quantityItems}`)
            console.log(`Total: ${totalItems}`)
            cli.verticalSpace()
          })
        }
      })
    }
  })
}

cli.responders.order = (str) => {
  const arr = str.split('--')
  const id = typeof arr[1] == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false
  if (id) {
    _data.read('orders', id, (errOrder, orderData) => {
      cli.horizontalLine()
      cli.centered(`ORDER ${id}`)
      let quantityItems = 0
      let totalItems = 0
      const items = _cleaners.getValidArrayObject(orderData)
      console.log(`ORDER ITEMS:`)
      items.forEach((item) => {
        quantityItems += item.quantity
        const total = item.quantity * item.price
        totalItems += total
        console.log(`- ${item.name} | ${item.quantity} X $${item.price} = $${total}`)
      })
      cli.horizontalLine()
      console.log(`Number of items: ${quantityItems}`)
      console.log(`Total: ${totalItems}`)
      cli.verticalSpace()
    })
  }
}

cli.responders.payments = () => {
  _data.list('payments', (err, listPayments) => {
    if (!err && listPayments) {
      listPayments.forEach((payment) => {
        if (!payment.includes('.md')) {
          console.log(`Id Payment: ${payment}`)
          cli.verticalSpace()
        }
      })
    }
  })
}

cli.responders.payment = (str) => {
  const arr = str.split('--')
  const id = typeof arr[1] == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false
  if (id) {
    _data.read('payments', id, (errPayment, paymentData) => {
      if (!errPayment && paymentData) {
        cli.horizontalLine()
        cli.centered(`PAYMENT ${id}`)
        console.dir(paymentData, { color: true })
        cli.horizontalLine()
        cli.verticalSpace()
      }
    })
  } else {
    console.log('Es necesario especificar el parametro con el id del pago')
  }
}

cli.responders.access = () => {
  console.log('Last access')
  _data.listAndRead('tokens', (err, tokens) => {
    if (!err && tokens) {
      tokens.forEach((token) => {
        console.dir(token, { color: true })
      })
    }
  })
}

cli.processInput = (str) => {
  str = typeof str === 'string' && str.trim().length > 0 ? str.trim() : false
  if (str) {
    var inputs = ['man', 'help', 'exit', 'stats', 'users', 'user', 'checks', 'check', 'logs', 'log', 'menu', 'item', 'orders', 'order', 'payments', 'payment', 'access']
    var matchFound = false
    var counter = 0
    inputs.some((input) => {
      if (str.toLowerCase().indexOf(input) !== -1) {
        matchFound = true
        e.emit(input, str)
        return true
      }
    })

    if (!matchFound) {
      console.log("Sorry, try with 'help'.")
    }
  }
}

cli.init = () => {
  console.log('\x1b[34m%s\x1b[0m', 'CLI is runing')
  const _interface = readline.createInterface({
    input: process.stdin,
    prompt: '',
  })
  _interface.prompt()
  _interface.on('line', (str) => {
    cli.processInput(str)
    _interface.prompt()
  })
  _interface.on('close', () => {
    process.exit(0)
  })
}

module.exports = cli
