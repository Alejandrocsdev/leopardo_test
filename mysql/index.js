const path = require('path')
const fs = require('fs')

let mysql = undefined
let env = undefined
const configPath = path.join(__dirname, '..', '..', '..', 'config', 'config.json')

try {
  mysql = require('mysql2')
} catch (error) {
  console.error('\x1b[31mERROR:\x1b[0m Please install \x1b[34mmysql2\x1b[0m package manually')
  process.exit(1) // Exit the process with an error code
}

try {
  env = require(configPath)
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

class Mysql {
  constructor(env) {
    this.connection = mysql.createConnection(env)
  }
  createDatabase(name) {
    this.connection.query(`CREATE DATABASE IF NOT EXISTS ${name}`, (err) => {
      if (err) {
        console.log('Fail to create database: ' + err)
        return
      }
      this.database(env, name, 'create')
      console.log(`Database \x1b[34m${name}\x1b[0m created successfully`)
    })
  }

  dropDatabase(name) {
    this.connection.query(`DROP DATABASE IF EXISTS ${name}`, (err) => {
      if (err) {
        console.log('Fail to drop database: ' + err)
        return
      }
      this.database(env, name, 'drop')
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

  createTable(name, columns) {
    this.connection.query(`CREATE TABLE IF NOT EXISTS ${name} (${columns})`, (err) => {
      if (err) {
        console.log('Fail to create table: ' + err)
        return
      }
      console.log(`Table '${name}' created successfully`)
    })
  }

  dropTable(name) {
    this.connection.query(`DROP TABLE IF EXISTS ${name}`, (err) => {
      if (err) {
        console.log('Fail to drop table: ' + err)
        return
      }
      console.log(`Table '${name}' dropped successfully`)
    })
  }
}

const db = new Mysql(env)

module.exports = db
