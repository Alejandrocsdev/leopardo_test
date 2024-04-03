const http = require('http')

const router = require('./routes')
// const middleware = require('./middlewares')

function leopardo() {
  const { get, post, put, patch, delete: del
    // , use 
  } = router

  // function use(middleware) {
  //   router.use(middleware)
  // }

  function listen(port, host = 'localhost', callback) {
    const server = http.createServer()
    server.on('request', (request, response) => {
      router.listener(request, response)
    })
    server.listen(port, host, callback)
  }

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    // use,
    listen
  }
}

module.exports = leopardo
