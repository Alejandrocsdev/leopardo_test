const http = require('http')

const router = require('./routes')
const middleware = require('./middlewares')
const engine = require('./engine')
const db = require('./mysql')

function leopardo() {
  const { get, post, put, patch, delete: del } = router

  function listen(port, host = 'localhost', callback) {
    const server = http.createServer()
    server.on('request', (request, response) => {
      
      response.render = function (file, data) {
        engine(file, data).then((result) => response.end(result))
      }

      router.listener(request, response)
    })
    server.listen(port, host, callback)
  }

  function use(middleware) {
    router.use(middleware)
  }

  leopardo.cors = middleware.cors
  leopardo.static = middleware.static
  leopardo.methodOverride = middleware.methodOverride
  leopardo.urlencoded = middleware.urlencoded
  // leopardo.engine = engine
  leopardo.db = db

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
