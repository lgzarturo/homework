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

app.bindForms = () => {
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
        const valueOfElement = elements[index].type === 'checkbox' ? elements[index].checked : elements[index].value
        payload[elements[index].name] = valueOfElement
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

app.formResponseProcessor = (formId, requestPayload, responsePayload) => {
  const functionToCall = false
  if (formId === 'accountCreate') {
    // @TODO Do something here now that the account has been created successfully
    console.log(`Procesando el formulario ${formId}`)
  }
}

app.init = () => {
  app.bindForms()
}

window.onload = () => {
  app.init()
}
