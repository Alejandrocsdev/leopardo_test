const fs = require('fs')
const path = require('path')
const process = require('process')
const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
const config = require(__dirname + '/../config/config.json')[env]
const db = {}
const { SQL } = require('leopardo')

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    )
  })
  .forEach((file) => {
    const Model = require(path.join(__dirname, file))
    const model = new Model()
    db[Model.modelName()] = model
  })

module.exports = db
