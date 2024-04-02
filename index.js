const http = require('http')
const url = require('url')

class Router {
  constructor() {
    this.routes = {}
    this.middlewares = []
  }

  get(path, handler) {
    this.addRoute('GET', path, handler)
  }

  post(path, handler) {
    this.addRoute('POST', path, handler)
  }

  put(path, handler) {
    this.addRoute('PUT', path, handler)
  }

  patch(path, handler) {
    this.addRoute('PATCH', path, handler)
  }

  delete(path, handler) {
    this.addRoute('DELETE', path, handler)
  }

  addRoute(method, path, handler) {
    if (!this.routes[path]) {
      this.routes[path] = {}
    }
    this.routes[path][method] = handler
  }

  use(middleware) {
    if (typeof middleware === 'function') {
      this.middlewares.push(middleware)
    }
  }

  requestListener(request, response) {
    const parsedUrl = url.parse(request.url)
    const route = this.routes[parsedUrl.pathname]

    this.middlewares.forEach((middleware) => {
      middleware(request, response)
    })

    if (route && route[request.method]) {
      route[request.method](request, response)
    } else {
      response.writeHead(404, { 'Content-Type': 'text/plain' })
      response.end('Not Found')
    }
  }
}

function leopardo() {
  const router = new Router()

  function get(path, handler) {
    router.get(path, handler)
  }

  function post(path, handler) {
    router.post(path, handler)
  }

  function put(path, handler) {
    router.put(path, handler)
  }

  function patch(path, handler) {
    router.patch(path, handler)
  }

  // Using 'del' instead of 'delete' to avoid conflict with the reserved keyword 'delete'
  // JavaScript does not allow using 'delete' as a function name due to its reserved status
  function del(path, handler) {
    router.delete(path, handler)
  }

  function use(middleware) {
    router.use(middleware)
  }

  function listen(port, host = 'localhost', callback) {
    const server = http.createServer((request, response) => {
      router.requestListener(request, response)
    })

    if (typeof host === 'function') {
      callback = host
      host = 'localhost'
    }

    server.listen(port, host, callback)
  }

  leopardo.cors = function() {
    return function cors(request, response) {
      response.setHeader('Access-Control-Allow-Origin', '*')
    }
  }

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    use,
    listen
  }
}

module.exports = leopardo
