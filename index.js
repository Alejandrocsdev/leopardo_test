const http = require('http')

const router = require('./routes')
const middleware = require('./middlewares')
const Mysql = require('./mysql')
const responseMethods = require('./response')

function leopardo() {
  const { get, post, put, patch, delete: del } = router

  function listen(port, host, callback) {
    const server = http.createServer()
    server.on('request', (request, response) => {
      responseMethods(response)
      router.listener(request, response)
    })
    if (typeof host === 'function') {
      callback = host
      host = 'localhost'
    }
    server.listen(port, host, callback)
  }
  function use(middleware) {
    router.use(middleware)
  }

  leopardo.cors = middleware.cors
  leopardo.static = middleware.static
  leopardo.methodOverride = middleware.methodOverride
  leopardo.urlencoded = middleware.urlencoded
  leopardo.db = new Mysql()

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
