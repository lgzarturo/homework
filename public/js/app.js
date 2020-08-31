/*
 * Frontend logic app
 */

const app = {}

app.config = {
  sessionToken: false,
}

app.client = {}

app.client.request = (headers, path, method, queryStringObject, payload, callback) => {
  // eslint-disable-next-line no-param-reassign
  headers = typeof headers === 'object' && headers !== null ? headers : {}
  // eslint-disable-next-line no-param-reassign
  path = typeof path === 'string' ? path : '/'
  // eslint-disable-next-line no-param-reassign
  method = typeof method === 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method) !== -1 ? method.toLowerCase() : 'GET'
  // eslint-disable-next-line no-param-reassign
  queryStringObject = typeof queryStringObject === 'object' && queryStringObject !== null ? queryStringObject : {}
  // eslint-disable-next-line no-param-reassign
  payload = typeof payload === 'object' && payload !== null ? payload : {}
  // eslint-disable-next-line no-param-reassign
  callback = typeof callback === 'function' ? callback : false

  let requestUrl = `${path}?`
  let counter = 0
  // eslint-disable-next-line no-restricted-syntax
  for (const queryKey in queryStringObject) {
    if (Object.prototype.hasOwnProperty.call(queryStringObject, queryKey)) {
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

  // eslint-disable-next-line no-restricted-syntax
  for (const headerKey in headers) {
    if (Object.prototype.hasOwnProperty.call(headers, headerKey)) {
      xhr.setRequestHeader(headerKey, headers[headerKey])
    }
  }

  if (app.config.sessionToken) {
    xhr.setRequestHeader('token', app.config.sessionToken.token)
    if (app.config.sessionToken.email !== undefined) {
      xhr.setRequestHeader('email', app.config.sessionToken.email)
    }
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
    console.log({ statusCode, responsePayload })
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
        const { elements } = this
        for (let index = 0; index < elements.length; index += 1) {
          if (elements[index].type !== 'submit') {
            const value = elements[index].type === 'checkbox' ? elements[index].checked : elements[index].value
            const classOfElement = typeof elements[index].classList.value === 'string' && elements[index].classList.value.length > 0 ? elements[index].classList.value : ''
            const elementIsChecked = elements[index].checked
            const nameOfElement = elements[index].name

            if (!elements[index].hasAttribute('data-ignore')) {
              if (nameOfElement === '_method') {
                method = value.toUpperCase()
              } else if (nameOfElement === '_id') {
                queryStrings.id = value
              } else if (elements[index].hasAttribute('data-query')) {
                queryStrings[nameOfElement] = value
              } else if (classOfElement.indexOf('multiselect') !== -1) {
                if (elementIsChecked) {
                  payload[nameOfElement] = typeof payload[nameOfElement] === 'object' && payload[nameOfElement] instanceof Array ? payload[nameOfElement] : []
                  payload[nameOfElement].push(parseInt(elements[index].value, 10))
                }
              } else if (classOfElement.indexOf('intval') !== -1) {
                payload[nameOfElement] = parseInt(value, 10)
              } else {
                payload[nameOfElement] = value
              }
            }
          }
        }

        app.client.request(undefined, path, method, queryStrings, payload, (statusCode, responsePayload) => {
          if (statusCode >= 200 && statusCode <= 226) {
            app.formResponseProcessor(formId, payload, responsePayload)
            document.querySelector(`#${formId} .formError`).style.display = 'none'
            if (document.querySelector(`#${formId} .formSuccess`)) {
              document.querySelector(`#${formId} .formSuccess`).style.display = 'block'
            }
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
        window.location = '/checks/all'
      }
    })
  }

  if (formId === 'sessionCreate') {
    app.setSessionToken(responsePayload)
    window.location = '/checks/all'
  }

  const formsWithSuccessMessages = ['accountEdit1', 'accountEdit2']
  if (formsWithSuccessMessages.indexOf(formId) !== -1) {
    document.querySelector(`#${formId} .formSuccess`).style.display = 'block'
  }

  if (formId === 'accountEdit3') {
    app.logUserOut(false)
    window.location = '/account/deleted'
  }

  if (formId === 'checksCreate') {
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
      token: currentToken.token,
      extend: true,
    }
    app.client.request(undefined, 'api/tokens', 'PUT', undefined, payload, (statusCodeToken, response) => {
      console.log({ response })
      if (statusCodeToken === 200) {
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
  if (primaryClass === 'checkList') {
    app.loadChecksListPage()
  }
  if (primaryClass === 'checkEdit') {
    app.loadChecksEditPage()
  }
  if (primaryClass === 'pizzaItems') {
    app.loadMenuItems()
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
        document.querySelector('#accountEdit1 .displayAddressInput').value = responsePayload.streetAddress

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

app.loadChecksListPage = () => {
  const email = typeof app.config.sessionToken.email === 'string' ? app.config.sessionToken.email : false
  if (email) {
    const queryStringObject = {
      email: email,
    }
    app.client.request(undefined, 'api/users', 'GET', queryStringObject, undefined, function (statusCode, responsePayload) {
      if (statusCode === 200) {
        const allChecks = typeof responsePayload.checks === 'object' && responsePayload.checks instanceof Array && responsePayload.checks.length > 0 ? responsePayload.checks : []
        if (allChecks.length > 0) {
          allChecks.forEach(function (checkId) {
            const newQueryStringObject = {
              id: checkId,
            }
            app.client.request(undefined, 'api/checks', 'GET', newQueryStringObject, undefined, function (statusCodeCheck, responsePayloadCheck) {
              if (statusCodeCheck === 200) {
                const table = document.getElementById('checksListTable')
                const tr = table.insertRow(-1)
                tr.classList.add('checkRow')
                const td0 = tr.insertCell(0)
                const td1 = tr.insertCell(1)
                const td2 = tr.insertCell(2)
                const td3 = tr.insertCell(3)
                const td4 = tr.insertCell(4)
                td0.innerHTML = responsePayloadCheck.method.toUpperCase()
                td1.innerHTML = `${responsePayloadCheck.protocol}://`
                td2.innerHTML = responsePayloadCheck.url
                td3.innerHTML = typeof responsePayloadCheck.state === 'string' ? responsePayloadCheck.state : 'unknown'
                td4.innerHTML = `<a href="/checks/edit?id=${responsePayloadCheck.id}">View / Edit / Delete</a>`
              } else {
                console.log('Error trying to load check ID: ', checkId)
              }
            })
          })

          if (allChecks.length < 5) {
            document.getElementById('createCheckCTA').style.display = 'block'
          }
        } else {
          document.getElementById('noChecksMessage').style.display = 'table-row'
          document.getElementById('createCheckCTA').style.display = 'block'
        }
      } else {
        app.logUserOut()
      }
    })
  } else {
    app.logUserOut()
  }
}

app.loadChecksEditPage = () => {
  const id = typeof window.location.href.split('=')[1] === 'string' && window.location.href.split('=')[1].length > 0 ? window.location.href.split('=')[1] : false
  if (id) {
    const queryStringObject = {
      id: id,
    }
    app.client.request(undefined, 'api/checks', 'GET', queryStringObject, undefined, function (statusCode, responsePayload) {
      if (statusCode === 200) {
        console.log({ statusCode, id })
        const hiddenIdInputs = document.querySelectorAll('input.hiddenIdInput')
        for (let i = 0; i < hiddenIdInputs.length; i += 1) {
          hiddenIdInputs[i].value = responsePayload.id
        }

        document.querySelector('#checksEdit1 .displayIdInput').value = responsePayload.id
        document.querySelector('#checksEdit1 .displayStateInput').value = responsePayload.state
        document.querySelector('#checksEdit1 .protocolInput').value = responsePayload.protocol
        document.querySelector('#checksEdit1 .urlInput').value = responsePayload.url
        document.querySelector('#checksEdit1 .methodInput').value = responsePayload.method
        document.querySelector('#checksEdit1 .timeoutInput').value = responsePayload.timeoutSeconds
        const successCodeCheckboxes = document.querySelectorAll('#checksEdit1 input.successCodesInput')
        for (let i = 0; i < successCodeCheckboxes.length; i += 1) {
          if (responsePayload.successCodes.indexOf(parseInt(successCodeCheckboxes[i].value, 10)) !== -1) {
            successCodeCheckboxes[i].checked = true
          }
        }
      } else {
        window.location = '/checks/all'
      }
    })
  } else {
    window.location = '/checks/all'
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

app.loadMenuItems = () => {
  app.client.request(undefined, 'api/menu', 'GET', undefined, undefined, (status, response) => {
    if (status === 200) {
      const items = typeof response === 'object' && response instanceof Object ? response : []
      console.log({ items })
      for (const key in items) {
        const item = items[key]
        const table = document.getElementById('itemsListTable')
        const tr = table.insertRow(-1)
        tr.classList.add('checkRow')
        const td0 = tr.insertCell(0)
        const td1 = tr.insertCell(1)
        const td2 = tr.insertCell(2)
        td0.innerHTML = item.code
        td1.innerHTML = item.name
        td2.innerHTML = item.price
      }
    } else {
      console.log('Error trying to load menu')
    }
  })
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
