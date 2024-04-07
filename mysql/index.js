const path = require('path')
const fs = require('fs')

// let mysql
// try {
//   mysql = require('mysql2')
// } catch (error) {
//   console.error('\x1b[31mERROR:\x1b[0m Please install \x1b[34mmysql2\x1b[0m package manually')
//   process.exit(1) // Exit the process with an error code
// }

// let env
// const configPath = path.join(__dirname, '..', '..', '..', 'config', 'config.json')
// try {
//   env = require(configPath)
// } catch (error) {
//   console.error(`\x1b[31mERROR:\x1b[0m Missing or invalid config.json file
//   Please create a \x1b[31mconfig.json\x1b[0m file inside the \x1b[31mconfig\x1b[0m folder in your project's \x1b[31mroot\x1b[0m directory.
//   The config.json file should contain your MySQL database configuration in the following format:
//   \x1b[31m{
//     "user": "your_username",
//     "host": "your_hostname",
//     "password": "your_password"
//   }\x1b[0m`)
//   process.exit(1) // Exit the process with an error code
// }

class Mysql {
  constructor(env) {
    this.connection = null
    this.mysql = null
    this.env = null
  }

  async init() {
    if (!this.mysql) {
      try {
        this.mysql = require('mysql2')
      } catch (error) {
        console.error('\x1b[31mERROR:\x1b[0m Please install \x1b[34mmysql2\x1b[0m package manually')
        process.exit(1) // Exit the process with an error code
      }
    }

    const configPath = path.join(__dirname, '..', '..', '..', 'config', 'config.json')
    try {
      this.env = require(configPath)
    } catch (error) {
      console.error(`\x1b[31mERROR:\x1b[0m Missing or invalid config.json file
      Please create a \x1b[31mconfig.json\x1b[0m file inside the \x1b[31mconfig\x1b[0m folder in your project's \x1b[31mroot\x1b[0m directory.
      The config.json file should contain your MySQL database configuration in the following format:
      \x1b[31m{
        "user": "your_username",
        "host": "your_hostname",
        "password": "your_password"
      }\x1b[0m`)
      process.exit(1) // Exit the process with an error code
    }
    this.connection = this.mysql.createConnection(this.env)
  }

  async createDatabase(name) {
    await this.init()
    this.connection.query(`CREATE DATABASE IF NOT EXISTS ${name}`, (err) => {
      if (err) {
        console.log('Fail to create database: ' + err)
        return
      }
      this.database(this.env, name, 'create')
      console.log(`Database \x1b[34m${name}\x1b[0m created successfully`)
    })
  }

  async dropDatabase(name) {
    await this.init()
    this.connection.query(`DROP DATABASE IF EXISTS ${name}`, (err) => {
      if (err) {
        console.log('Fail to drop database: ' + err)
        return
      }
      this.database(this.env, name, 'drop')
      console.log(`Database \x1b[31m${name}\x1b[0m dropped successfully`)
    })
  }

  database(env, name, type) {
    if (type === 'create') {
      env.database = name
    } else if (type === 'drop') {
      delete env.database
    }
    fs.writeFileSync(`${__dirname}/../../../config/config.json`, JSON.stringify(env))
  }

  async createTable(name, column) {
    await this.init()
    const entries = Object.entries(column)
    let columns = ''
    entries.forEach((e) => {
      const field = e[0]
      if (e[1].Type === undefined) {
        console.error(`Error: Type is undefined for field '${field}'`)
        return
      }
      const attrs = [e[1].Type, e[1].Null, e[1].Key, e[1].Default, e[1].Extra]
        .filter(Boolean)
        .join(' ')
      columns += `${field} ${attrs},`
    })
    columns = columns.slice(0, -1)

    this.connection.query(`CREATE TABLE IF NOT EXISTS ${name} (${columns})`, (err) => {
      if (err) {
        console.log('Fail to create table: ' + err)
        return
      }
      console.log(`Table '${name}' created successfully`)
    })
  }

  async dropTable(name) {
    await this.init()
    this.connection.query(`DROP TABLE IF EXISTS ${name}`, (err) => {
      if (err) {
        console.log('Fail to drop table: ' + err)
        return
      }
      console.log(`Table '${name}' dropped successfully`)
    })
  }

  async bulkInsert(name, data) {
    await this.init()
    if (Array.isArray(Object.values(data)[0])) {
      data = Object.values(data)[0]
    }
    const keys = Object.keys(data[0]).filter((key) => key !== 'id')
    const fields = String(keys)
    let values = ''
    data.forEach((row) => {
      delete row.id
      values += `('${Object.values(row).join("','")}'),`
    })
    values = values.slice(0, -1) + ';'
    this.connection.query(`INSERT INTO ${name} (${fields}) VALUES ${values}`, (err) => {
      if (err) {
        console.log('Fail to bulk insert rows: ' + err)
        return
      }
      console.log(`Values bulk inserted into '${name}' table successfully`)
    })
  }

  async bulkDelete(name) {
    await this.init()
    this.connection.query(`DELETE FROM ${name};`, (err) => {
      if (err) {
        console.log('Fail to delete rows: ' + err)
        return
      }
      console.log(`Values bulk deleted from '${name}' table successfully`)
    })
  }

  async insertRow(name, body) {
    await this.init()
    const field = String(Object.keys(body))
    const value = Object.values(body)
      .map((value) => this.connection.escape(value))
      .join(',')
    this.connection.query(`INSERT INTO ${name} (${field}) VALUES (${value});`, (err) => {
      if (err) {
        console.log('Fail to insert row: ' + err)
        return
      }
      console.log(`Value inserted into '${name}' table successfully`)
    })
  }

  async updateRow(name, body, id) {
    await this.init()
    const row = Object.entries(body)
      .map(([key, value]) => `${this.connection.escapeId(key)} = ${this.connection.escape(value)}`)
      .join(',')

    this.connection.query(`UPDATE ${name} SET ${row} WHERE id = ${id};`, (err) => {
      if (err) {
        console.log('Fail to update row: ' + err)
        return
      }
      console.log(`Value from '${name}' table updated successfully`)
    })
  }

  async deleteRow(name, id) {
    await this.init()
    this.connection.query(`DELETE FROM ${name} WHERE id = ${id};`, (err) => {
      if (err) {
        console.log('Fail to delete row: ' + err)
        return
      }
      console.log(`Value deleted from '${name}' table successfully`)
    })
  }

  async select(name) {
    await this.init()
    return new Promise((resolve, reject) => {
      this.connection.query(`SELECT * FROM ${name};`, (err, results) => {
        if (err) {
          console.log('Fail to select table: ' + err)
          reject(err)
          return
        }
        console.log(`Select from '${name}' table successfully`)
        resolve(results)
      })
    })
  }

  async getData(name) {
    try {
      const results = await this.select(name)
      return results
    } catch (err) {
      console.error(err)
      return null
    }
  }

  script(up, down) {
    const args = process.argv.slice(2)
    if (args.length !== 1 || !['up', 'down'].includes(args[0])) {
      console.error('Usage: node script.js <up|down>')
      process.exit(1)
    }
    const command = args[0]
    if (command === 'up') {
      up()
    } else if (command === 'down') {
      down()
    }
  }
}
const sql = new Mysql()
module.exports = sql
