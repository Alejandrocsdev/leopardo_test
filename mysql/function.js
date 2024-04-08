const Mysql = require('.')

function createTable(name, column) {
  const sql = new Mysql()
  sql.createTable(name, column)
}

module.exports = createTable