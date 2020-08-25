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
  method = typeof method === 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method.toLowerCase()) !== -1 ? method.toLowerCase() : 'GET'
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
