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

e.on('list users', (str) => {
  cli.responders.users()
})

e.on('more user info', (str) => {
  cli.responders.user(str)
})

e.on('list checks', (str) => {
  cli.responders.cheks(str)
})

e.on('more check info', (str) => {
  cli.responders.check(str)
})

e.on('list logs', (str) => {
  cli.responders.logs()
})

e.on('more log info', (str) => {
  cli.responders.log(str)
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
    'list users': 'Show list of the users',
    'more user info --{userId}': 'Details of the user',
    'list checks --up --down': 'Show a list of the checks',
    'more check info --{checkId}': 'Details of the check',
    'list logs': 'Show a list of the log files',
    'more log info --{fileName}': 'Show details of the log file',
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
  console.log('You ask for list Users')
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
  console.log('You ask for a single User', str)
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
  console.log('You ask for list Checks', str)
}

cli.responders.check = (str) => {
  console.log('You ask for a single Check', str)
}

cli.responders.logs = () => {
  console.log('You ask for list Logs')
}

cli.responders.log = (str) => {
  console.log('You ask for a single Log', str)
}

cli.processInput = (str) => {
  str = typeof str === 'string' && str.trim().length > 0 ? str.trim() : false
  if (str) {
    var inputs = ['man', 'help', 'exit', 'stats', 'list users', 'more user info', 'list checks', 'more check info', 'list logs', 'more log info']
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
    output: process.stdout,
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
