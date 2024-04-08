// Importing required modules and files
const http = require('http')
const router = require('./routes')
const middleware = require('./middlewares')
const extendResponse = require('./response')
const Mysql = require('./mysql')
const sql = new Mysql()

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
  // leopardo.Mysql = Mysql
  leopardo.prototype.Mysql = new Mysql()
  // const sql = new Mysql()
  // const sql.createTable
  // const middleware = new Middleware()
  leopardo.createtable = sql.createtable

  // Return an object with HTTP methods and middleware functions
  return {
    get,
    post,
    put,
    patch,
    delete: del,
    use,
    listen,
    sql: new Mysql()
  }
}
const propertyNames = Object.getOwnPropertyNames(leopardo);
console.log(propertyNames);

// Get property descriptors of the function
const propertyDescriptors = Object.getOwnPropertyDescriptors(leopardo);
console.log(propertyDescriptors);
// Export the leopardo function as the module
module.exports = leopardo
