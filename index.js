// Importing required modules and files
const http = require('http')
const router = require('./routes')
const middleware = require('./middlewares')
const extendResponse = require('./response')
const SQL = require('./mysql')
const Model = require('./mysql/model.js')

// Main function for creating the leopardo framework
function leopardo() {
  // Destructuring functions from router methods
  const { get, post, put, patch, delete: del } = router

  // Function to start the HTTP server
  function listen(port, host, callback) {
    try {
      // Create a new HTTP server instance
      const server = http.createServer()
      // Request listener to handle incoming requests
      server.on('request', (request, response) => {
        // Add custom response methods to the response object
        extendResponse(response)
        // Call the request listener from the router to handle the request
        router.listener(request, response)
      })
      // If host is a function, assume it's the callback and set default host
      if (typeof host === 'function') {
        callback = host
        host = 'localhost'
      }
      // Start listening on the specified port and host
      server.listen(port, host, callback)
    } catch (error) {
      console.error('Failed to start server:', error)
    }
  }

  // Function to register middleware
  function use(middleware) {
    router.use(middleware)
  }

  // Attach middleware properties to the leopardo object
  leopardo.cors = middleware.cors
  leopardo.static = middleware.static
  leopardo.methodOverride = middleware.methodOverride
  leopardo.urlencoded = middleware.urlencoded

  // Return an object with HTTP methods and middleware functions
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
module.exports.SQL = SQL
module.exports.Model = Model
