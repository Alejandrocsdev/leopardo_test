const http = require('http')

const router = require('./routes')
const middleware = require('./middlewares')
const engine = require('./engine')

function leopardo() {
  const { get, post, put, patch, delete: del } = router

  function listen(port, host = 'localhost', callback) {
    const server = http.createServer()
    server.on('request', (request, response) => {
      response.render = engine
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
  leopardo.engine = engine

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
