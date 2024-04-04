const http = require('http')

const router = require('./routes')
const middleware = require('./middlewares')

function leopardo() {
  const { get, post, put, patch, delete: del } = router

  function listen(port, host = 'localhost', callback) {
    const server = http.createServer()
    server.on('request', (request, response) => {
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
