/**
 * CLI Tasks
 */

const readline = require('readline')
const util = require('util')
const debug = util.debug('cli')
const events = require('events')
class _events extends events {}
const e = new _events()

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

cli.responders.help = () => {
  console.log('You ask for help!')
}

cli.responders.exit = () => {
  console.log('Saliendo del sistema!')
}

cli.responders.stats = () => {
  console.log('You ask for Stats')
}

cli.responders.users = () => {
  console.log('You ask for list Users')
}

cli.responders.user = (str) => {
  console.log('You ask for a single User', str)
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
