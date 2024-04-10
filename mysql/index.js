const path = require('path')
const fs = require('fs')

const colors = require('../utilities/color')
const red = colors.red
const blue = colors.blue
const underline = colors.underline
const reset = colors.reset

class Mysql {
  constructor() {
    this.connection = null
    this.mysql = null
    this.env = null
  }

  moduleCheck() {
    try {
      this.mysql = require('mysql2')
    } catch (error) {
      console.error(`${red}ERROR:${reset} Please install ${red}mysql2${reset} package manually.`)
      process.exit(1)
    }
  }

  configCheck() {
    const configPath = path.join(__dirname, '..', '..', '..', 'config', 'config.json')
    try {
      this.env = require(configPath)
      console.log('Loaded configuration file "config\\config.json".')
    } catch (error) {
      console.error(`${red}ERROR:${reset} Missing or invalid config.json file.

Please make sure that the config.json file is present in the config folder of your project's root directory.
If the config.json file is missing, you can generate it by running one of the following commands:
1. leopardo-sql init
2. leopardo-sql init:config`)
      process.exit(1)
    }
  }

  async init(mode) {
    this.moduleCheck()
    this.configCheck()
    mode = this.modeSwitch(mode)
    this.env = this.env[mode]
    this.connection = this.mysql.createConnection(this.env)
  }

  modeSwitch(mode) {
    const args = process.argv.slice(2)
    if (args[1] === '--env' && args[2]) {
      if (args[2] === 'development' || args[2] === 'test' || args[2] === 'production') {
        mode = args[2]
        console.log(`Using environment "${mode}".`)
      } else {
        console.log(`${red}ERROR:${reset} Invalid command.`)
        process.exit(1)
      }
    } else if (mode === undefined && !args[1]) {
      mode = 'development'
      console.log(`Using environment "${mode}".`)
    } else {
      console.log(`${red}ERROR:${reset} Invalid command.`)
      process.exit(1)
    }
    return mode
  }

  createDatabase(mode) {
    this.moduleCheck()
    this.configCheck()
    mode = this.modeSwitch(mode)
    const env = this.env[mode]
    const name = env.database
    const connection = this.mysql.createConnection({
      host: env.host,
      user: env.user,
      password: env.password
    })
    connection.query(`CREATE DATABASE IF NOT EXISTS ${name}`, (err) => {
      if (err) {
        console.log(`${red}ERROR:${reset} Fail to create database. ${err.message}.`)
        return
      }
      console.log(`Database ${blue}${name}${reset} created.`)
      connection.end()
    })
  }

  async dropDatabase(mode) {
    await this.init()
    const env = this.env
    const name = env.database
    this.connection.query(`DROP DATABASE IF EXISTS ${name}`, (err) => {
      if (err) {
        console.log(`${red}ERROR:${reset} Fail to drop database. ${err.message}.`)
        return
      }
      console.log(`Database ${blue}${name}${reset} dropped.`)
      this.connection.end()
    })
  }

  async createTable(name, column) {
    await this.init()
    const entries = Object.entries(column)
    let columns = ''
    entries.forEach((e) => {
      const field = e[0]
      if (e[1].Type === undefined) {
        console.error(`${red}ERROR:${reset} Type is undefined for field '${field}'`)
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
        console.log(`${red}ERROR:${reset} Fail to create table. ${err.message}.`)
        return
      }
      console.log(`Table ${blue}${name}${reset} created.`)
    })
  }

  async dropTable(name) {
    await this.init()
    this.connection.query(`DROP TABLE IF EXISTS ${name}`, (err) => {
      if (err) {
        console.log(`${red}ERROR:${reset} Fail to drop table. ${err.message}.`)
        return
      }
      console.log(`Table ${blue}${name}${reset} dropped.`)
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
}

const SQL = new Mysql()
module.exports = SQL
