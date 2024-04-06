// module
const url = require('url')
const requestMethods = require('../request')
// utility
const identifier = require('../utilities/identifier')
// variable
const routes = new Map()
// class
class Router {
  constructor() {
    this.routes = {}
    this.middlewares = []
  }

  get(path, handler, method = 'GET') {
    addRoute(path, method, handler)
  }

  post(path, handler, method = 'POST') {
    addRoute(path, method, handler)
  }

  put(path, handler, method = 'PUT') {
    addRoute(path, method, handler)
  }

  patch(path, handler, method = 'PATCH') {
    addRoute(path, method, handler)
  }

  delete(path, handler, method = 'DELETE') {
    addRoute(path, method, handler)
  }

  use(middleware) {
    if (typeof middleware === 'function') {
      this.middlewares.push(middleware)
    }
  }

  listener(request, response) {
    const path = url.parse(request.url).pathname
    let middlewareIndex = 0

    const next = () => {
      middlewareIndex++
      if (middlewareIndex < this.middlewares.length) {
        this.middlewares[middlewareIndex](request, response, next)
      } else {
        processRoutes()
      }
    }

    const processMiddlewares = () => {
      if (middlewareIndex < this.middlewares.length) {
        this.middlewares[middlewareIndex](request, response, next)
      } else {
        processRoutes()
      }
    }

    const processRoutes = () => {
      for (const [id, route] of routes) {
        // requestMethods(request, route)
        request.params = {}

        const pathSegments = path.split('/')
        const routeSegments = route.path.split('/')

        if (routeSegments.length !== pathSegments.length) {
          continue // Skip this route if the number of segments doesn't match
        }

        let match = true
        for (let i = 0; i < routeSegments.length; i++) {
          if (routeSegments[i].startsWith(':')) {
            const paramName = routeSegments[i].substring(1)
            request.params[paramName] = pathSegments[i]
            // Skip dynamic segments
            continue
          }
          if (routeSegments[i] !== pathSegments[i]) {
            match = false
            break
          }
        }

        if (match && request.method === route.method) {
          
          route.handler(request, response)
          return
        }
      }
    }

    processMiddlewares()
  }
}

function addRoute(path, method, handler) {
  const id = identifier.id()
  routes.set(id, { path, method, handler })
}

const router = new Router()
module.exports = router
