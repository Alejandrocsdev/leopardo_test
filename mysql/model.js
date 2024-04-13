const SQL = require('.')
const pluralize = require('pluralize')

// class Model {
//   findAll(name) {
//     console.log(name)
//     SQL.select(name)
//   }
// }

class Model {
  // async findAll(name) {
  //   console.log(name) // Accessing static method from subclass
  //   return await SQL.select(name)
  // }
  async findAll() {
    SQL.constructor.enableLogging = false
    const modelName = this.constructor.modelName()
    const tableName = pluralize(modelName)
    return await SQL.select(tableName, false)
  }
}

module.exports = Model

// async select(name, endConnect = true) {
//   if (!this.connection) {
//     await this.init()
//   }
//   return new Promise((resolve, reject) => {
//     this.connection.query(`SELECT * FROM ${name};`, (err, results) => {
//       if (err) {
//         console.log('Fail to select table: ' + err)
//         reject(err)
//         return
//       }
//       Mysql.log(`Select from '${name}' table successfully`)
//       if (endConnect) {
//         this.connection.end()
//       }
//       resolve(results)
//     })
//   })
// }