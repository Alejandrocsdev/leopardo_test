// Import necessary modules and files
const url = require('url')
const { requestParams, requestQuery } = require('../request')
const identifier = require('../utilities/identifier')

// Create a new Map to store routes
const routes = new Map()

// Router class to manage routes and middlewares
class Router {
  constructor() {
    this.middlewares = []
  }

  // Add a GET route
  get(path, handler) {
    addRoute(path, handler, 'GET')
  }
  // Add a POST route
  post(path, handler) {
    addRoute(path, handler, 'POST')
  }
  // Add a PUT route
  put(path, handler) {
    addRoute(path, handler, 'PUT')
  }
  // Add a PATCH route
  patch(path, handler) {
    addRoute(path, handler, 'PATCH')
  }
  // Add a DELETE route
  delete(path, handler) {
    addRoute(path, handler, 'DELETE')
  }

  // Add a middleware
  use(middleware) {
    if (typeof middleware === 'function') {
      this.middlewares.push(middleware)
    }
  }

  // Request listener for processing incoming requests
  listener(request, response) {
    const path = url.parse(request.url).pathname
    let middlewareIndex = 0

    // Function to process middlewares
    const processMiddlewares = () => {
      if (middlewareIndex < this.middlewares.length) {
        this.middlewares[middlewareIndex](request, response, next)
      } else {
        processRoutes()
      }
    }

    // Function to move to the next middleware
    const next = () => {
      middlewareIndex++
      processMiddlewares()
    }

    // Function to process routes
    const processRoutes = () => {
      for (const [id, route] of routes) {
        // Add params methods to the response object
        if (requestParams(request, route) && request.method === route.method) {
          // Add query methods to the response object
          requestQuery(request)
          route.handler(request, response)
          return
        }
      }
    }

    // Start processing middlewares
    processMiddlewares()
  }
}

// Function to add a route to the routes Map
function addRoute(path, handler, method) {
  const id = identifier.id()
  routes.set(id, { path, handler, method})
}

// Create a new instance of the Router class and export it
const router = new Router()
module.exports = router
