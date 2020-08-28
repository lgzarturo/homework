/*
 * Frontend logic app
 */

const app = {}

app.config = {
  sessionToken: false,
}

app.client = {}

app.client.request = (headers, path, method, queryStringObject, payload, callback) => {
  headers = typeof headers === 'object' && headers !== null ? headers : {}
  path = typeof path === 'string' ? path : '/'
  method = typeof method === 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method) !== -1 ? method.toLowerCase() : 'GET'
  queryStringObject = typeof queryStringObject === 'object' && queryStringObject !== null ? queryStringObject : {}
  payload = typeof payload === 'object' && payload !== null ? payload : {}
  callback = typeof callback === 'function' ? callback : false

  let requestUrl = `${path}?`
  let counter = 0
  for (const queryKey in queryStringObject) {
    if (queryStringObject.hasOwnProperty(queryKey)) {
      counter += 1
      if (counter > 1) {
        requestUrl = `${requestUrl}&`
      }
      requestUrl = `${requestUrl}${queryKey}=${queryStringObject[queryKey]}`
    }
  }

  const xhr = new XMLHttpRequest()
  xhr.open(method, requestUrl, true)
  xhr.setRequestHeader('content-type', 'application/json')

  for (const headerKey in headers) {
    if (headers.hasOwnProperty(headerKey)) {
      xhr.setRequestHeader(headerKey, headers[headerKey])
    }
  }

  if (app.config.sessionToken) {
    xhr.setRequestHeader('token', app.config.sessionToken.id)
  }

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      const { status } = xhr
      const response = xhr.responseText
      if (callback) {
        try {
          const parsedResponse = JSON.parse(response)
          callback(status, parsedResponse)
        } catch (error) {
          callback(status, false)
        }
      }
    }
  }

  const payloadString = JSON.stringify(payload)
  xhr.send(payloadString)
}

app.bindLogoutButton = () => {
  document.getElementById('logoutButton').addEventListener('click', function (e) {
    e.preventDefault()
    app.logUserOut()
  })
}

app.logUserOut = () => {
  const tokenId = typeof app.config.sessionToken.id === 'string' ? app.config.sessionToken.id : false
  const queryStringObject = {
    id: tokenId,
  }
  app.client.request(undefined, 'api/tokens', 'DELETE', queryStringObject, undefined, (statusCode, responsePayload) => {
    app.setSessionToken(false)
    window.location = '/session/delete'
  })
}

app.bindForms = () => {
  if (document.querySelector('form')) {
    document.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault()
      const formId = this.id
      const path = this.action
      const method = this.method.toUpperCase()

      document.querySelector(`#${formId} .formError`).style.display = 'hidden'

      const payload = {}
      const { elements } = this
      for (let index = 0; index < elements.length; index += 1) {
        if (elements[index].type !== 'submit') {
          payload[elements[index].name] = elements[index].type === 'checkbox' ? elements[index].checked : elements[index].value
        }
      }

      app.client.request(undefined, path, method, undefined, payload, (statusCode, responsePayload) => {
        if (statusCode >= 200 && statusCode <= 226) {
          app.formResponseProcessor(formId, payload, responsePayload)
          document.querySelector(`#${formId} .formError`).style.display = 'none'
        } else {
          const error = typeof responsePayload.error === 'string' ? responsePayload.error : 'Ha ocurrido un error, please try again'
          document.querySelector(`#${formId} .formError`).innerHTML = error
          document.querySelector(`#${formId} .formError`).style.display = 'block'
        }
      })
    })
  }
}

app.formResponseProcessor = (formId, requestPayload, responsePayload) => {
  const functionToCall = false
  if (formId === 'accountCreate') {
    console.log(`Procesando el formulario ${formId}`)
    const newPayload = {
      phone: requestPayload.phone,
      password: requestPayload.password,
    }

    app.client.request(undefined, 'api/tokens', 'POST', undefined, newPayload, (newStatusCode, newResponsePayload) => {
      if (newStatusCode !== 200) {
        document.querySelector(`#${formId} .formError`).innerHTML = 'Ha ocurrido un error. Please try again.'
        document.querySelector(`#${formId} .formError`).style.display = 'block'
      } else {
        app.setSessionToken(newResponsePayload)
        window.location = '/checks/all'
      }
    })
  }

  if (formId === 'sessionCreate') {
    app.setSessionToken(responsePayload)
    window.location = '/checks/all'
  }
}

app.getSessionToken = () => {
  const tokenString = localStorage.getItem('token')
  if (typeof tokenString === 'string') {
    try {
      const token = JSON.parse(tokenString)
      app.config.sessionToken = token
      if (typeof token === 'object') {
        app.setLoggedInClass(true)
      } else {
        app.setLoggedInClass(false)
      }
    } catch (e) {
      app.config.sessionToken = false
      app.setLoggedInClass(false)
    }
  }
}

app.setLoggedInClass = (add) => {
  const target = document.querySelector('body')
  if (add) {
    target.classList.add('loggedIn')
  } else {
    target.classList.remove('loggedIn')
  }
}

app.setSessionToken = (token) => {
  app.config.sessionToken = token
  const tokenString = JSON.stringify(token)
  localStorage.setItem('token', tokenString)
  if (typeof token === 'object') {
    app.setLoggedInClass(true)
  } else {
    app.setLoggedInClass(false)
  }
}

app.renewToken = (callback) => {
  const currentToken = typeof app.config.sessionToken === 'object' ? app.config.sessionToken : false
  if (currentToken) {
    const payload = {
      id: currentToken.id,
      extend: true,
    }
    app.client.request(undefined, 'api/tokens', 'PUT', undefined, payload, (statusCode, responsePayload) => {
      if (statusCode === 200) {
        const queryStringObject = { id: currentToken.id }
        app.client.request(undefined, 'api/tokens', 'GET', queryStringObject, undefined, (statusCode, responsePayload) => {
          if (statusCode === 200) {
            app.setSessionToken(responsePayload)
            callback(false)
          } else {
            app.setSessionToken(false)
            callback(true)
          }
        })
      } else {
        app.setSessionToken(false)
        callback(true)
      }
    })
  } else {
    app.setSessionToken(false)
    callback(true)
  }
}

app.tokenRenewalLoop = () => {
  setInterval(() => {
    app.renewToken((err) => {
      if (!err) {
        console.log(`Se ha renovado el token @ ${Date.now()}`)
      }
    })
  }, 1000 * 60)
}

app.init = () => {
  app.bindForms()
  app.bindLogoutButton()
  app.getSessionToken()
  app.tokenRenewalLoop()
}

window.onload = () => {
  app.init()
}
