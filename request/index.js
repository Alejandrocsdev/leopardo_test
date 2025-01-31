const url = require('url')

const requestParams = (request, route) => {
  const path = url.parse(request.url).pathname
  request.params = {}

  const pathSegments = path.split('/')
  const routeSegments = route.path.split('/')

  if (routeSegments.length !== pathSegments.length) {
    return false // Skip this route if the number of segments doesn't match
  }

  for (let i = 0; i < routeSegments.length; i++) {
    if (routeSegments[i].startsWith(':')) {
      const paramName = routeSegments[i].substring(1)
      request.params[paramName] = pathSegments[i]
      // Skip dynamic segments
      continue
    }
    if (routeSegments[i] !== pathSegments[i]) {
      return false
    }
  }

  return request.method === route.method
}

const requestQuery = (request) => {
  request.query = {}
  const parseUrl = url.parse(request.url)
  if (parseUrl.query) {
    const queryParams = parseUrl.query.split('&')

    for (const param of queryParams) {
      const [key, value] = param.split('=')
      request.query[key] = value
    }
  }
}

module.exports = { requestParams, requestQuery }
