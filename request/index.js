const url = require('url')
function requestMethods(request, route) {
  request.params = {}

  const path = url.parse(request.url).pathname
  const pathSegments = path.split('/')
  const routeSegments = route.path.split('/')
  for (let i = 0; i < routeSegments.length; i++) {
    if (routeSegments[i].startsWith(':')) {
      const paramName = routeSegments[i].substring(1)
      request.params[paramName] = pathSegments[i]
    }
  }
}

module.exports = requestMethods
