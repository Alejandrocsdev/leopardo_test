// module
const url = require('url')
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
        if (path === route.path && request.method === route.method) {
          route.handler(request, response)
          return
        }
      }
    }

    processMiddlewares()

    // this.middlewares.forEach((middleware) => {
    //   middleware(request, response, next)
    // })

    // for (const [id, route] of routes) {
    //   if (path === route.path && method === route.method) {
    //     route.handler(request, response)
    //     return
    //   }
    // }
  }
}

function addRoute(path, method, handler) {
  const id = identifier.id()
  routes.set(id, { path, method, handler })
}

const router = new Router()
module.exports = router
