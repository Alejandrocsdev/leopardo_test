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
    // this.middlewares = []
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

  // use(middleware) {
  //   if (typeof middleware === 'function') {
  //     this.middlewares.push((request, response, next) => {
  //       middleware(request, response, next)
  //     })
  //   }
  // }

  listener(request, response) {
    const path = url.parse(request.url).pathname
    const method = request.method

    // this.middlewares.forEach((middleware) => {
    //   middleware(request, response)
    // })

    for (const [id, route] of routes) {
      if (path === route.path && method === route.method) {
        route.handler(request, response)
        return
      }
    }
  }
}

function addRoute(path, method, handler) {
  const id = identifier.id()
  routes.set(id, { path, method, handler })
}

const router = new Router()
module.exports = router
