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
    xhr.setRequestHeader('token', app.config.sessionToken.token)
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
  const tokenId = typeof app.config.sessionToken.token === 'string' ? app.config.sessionToken.token : false
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
    const allForms = document.querySelectorAll('form')
    for (let i = 0; i < allForms.length; i += 1) {
      allForms[i].addEventListener('submit', function (e) {
        e.preventDefault()
        const formId = this.id
        const path = this.action
        let method = this.method.toUpperCase()

        document.querySelector(`#${formId} .formError`).style.display = 'none'
        if (document.querySelector(`#${formId} .formSuccess`)) {
          document.querySelector(`#${formId} .formSuccess`).style.display = 'none'
        }

        const payload = {}
        const queryStrings = {}
        const headers = {}
        const { elements } = this
        for (let index = 0; index < elements.length; index += 1) {
          if (elements[index].type !== 'submit') {
            const value = elements[index].type === 'checkbox' ? elements[index].checked : elements[index].value

            if (!elements[index].hasAttribute('data-ignore')) {
              if (elements[index].name === '_method') {
                method = value.toUpperCase()
              } else if (elements[index].hasAttribute('data-query')) {
                queryStrings[elements[index].name] = value
              } else if (elements[index].hasAttribute('data-header')) {
                headers[elements[index].name] = value
              } else {
                payload[elements[index].name] = value
              }
            }
          }
        }

        console.log({ headers, queryStrings, payload })

        app.client.request(headers, path, method, queryStrings, payload, (statusCode, responsePayload) => {
          if (statusCode >= 200 && statusCode <= 226) {
            app.formResponseProcessor(formId, payload, responsePayload)
            document.querySelector(`#${formId} .formError`).style.display = 'none'
          } else if (statusCode === 403) {
            app.logUserOut()
          } else {
            document.querySelector(`#${formId} .formError`).innerHTML = typeof responsePayload.error === 'string' ? responsePayload.error : 'Ha ocurrido un error, please try again'
            document.querySelector(`#${formId} .formError`).style.display = 'block'
          }
        })
      })
    }
  }
}

app.formResponseProcessor = (formId, requestPayload, responsePayload) => {
  const functionToCall = false
  if (formId === 'accountCreate') {
    console.log(`Procesando el formulario ${formId}`)
    const newPayload = {
      email: requestPayload.email,
      password: requestPayload.password,
    }

    app.client.request(undefined, 'api/tokens', 'POST', undefined, newPayload, (newStatusCode, newResponsePayload) => {
      if (newStatusCode !== 200) {
        document.querySelector(`#${formId} .formError`).innerHTML = 'Ha ocurrido un error. Please try again.'
        document.querySelector(`#${formId} .formError`).style.display = 'block'
      } else {
        app.setSessionToken(newResponsePayload)
        window.location = 'account/edit' // '/checks/all'
      }
    })
  }

  if (formId === 'sessionCreate') {
    app.setSessionToken(responsePayload)
    window.location = 'account/edit' // '/checks/all'
  }

  const formsWithSuccessMessages = ['accountEdit1', 'accountEdit2']
  if (formsWithSuccessMessages.indexOf(formId) !== -1) {
    document.querySelector(`#${formId} .formSuccess`).style.display = 'block'
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
      token: currentToken.token,
      extend: true,
    }
    app.client.request(undefined, 'api/tokens', 'PUT', undefined, payload, (statusCode, responsePayload) => {
      if (statusCode === 200) {
        const queryStringObject = { token: currentToken.token }
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

app.loadDataOnPage = () => {
  const bodyClasses = document.querySelector('body').classList
  const primaryClass = typeof bodyClasses[0] === 'string' ? bodyClasses[0] : false
  if (primaryClass === 'accountEdit') {
    app.loadAccountEditPage()
  }
}

app.loadAccountEditPage = () => {
  const email = typeof app.config.sessionToken.email === 'string' ? app.config.sessionToken.email : false
  if (email) {
    const queryStringObject = {
      email: email,
    }
    app.client.request(undefined, 'api/users', 'GET', queryStringObject, undefined, (statusCode, responsePayload) => {
      console.log({ statusCode })
      if (statusCode === 200) {
        document.querySelector('#accountEdit1 .fullNameInput').value = responsePayload.name
        document.querySelector('#accountEdit1 .emailInput').value = responsePayload.email
        document.querySelector('#accountEdit1 .displayPhoneInput').value = responsePayload.phone
        document.querySelector('#accountEdit1 .displayAddressInput').value = responsePayload.address

        const hiddenPhoneInputs = document.querySelectorAll('input.hiddenEmailInput')
        for (let i = 0; i < hiddenPhoneInputs.length; i += 1) {
          hiddenPhoneInputs[i].value = responsePayload.email
        }
      } else {
        app.logUserOut()
      }
    })
  } else {
    app.logUserOut()
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
  app.loadDataOnPage()
}

window.onload = () => {
  app.init()
}
