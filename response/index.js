const engine = require('../engine')

function responseMethods(response) {
  response.render = function (file, data) {
    engine(file, data).then((result) => response.end(result))
  }

  response.send = function (data) {
    response.end(data)
  }

  response.redirect = function (path) {
    response.writeHead(302, { Location: path })
    response.end()
  }

  response.type = function (type) {
    let contentType
    if (type === 'html') {
      contentType = 'text/html'
    } else if (type === 'js') {
      contentType = 'application/javascript'
    } else if (type === 'json') {
      contentType = 'application/json'
    }
    response.setHeader('Content-Type', contentType)
  }
}

module.exports = responseMethods
