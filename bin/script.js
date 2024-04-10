#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const SQL = require('../mysql')
const timestamp = require('../utilities/timestamp')

const colors = require('../utilities/color')
const underline = colors.underline
const reset = colors.reset

const leopardoV = require('leopardo/package.json').version
const nodeV = process.version.substring(1)

const commandHelper = `leopardo-sql <command>

Commands:
  leopardo-sql db:migrate                        Run pending migrations
  leopardo-sql db:migrate:undo                   Reverts a migration
  leopardo-sql db:migrate:undo:all               Revert all migrations ran
  leopardo-sql db:seed                           Run specified seeder
  leopardo-sql db:seed:undo                      Deletes data from the database
  leopardo-sql db:seed:all                       Run every seeder
  leopardo-sql db:seed:undo:all                  Deletes data from the database
  leopardo-sql db:create                         Create database; update configuration; create migrationlog table
  leopardo-sql db:drop                           Drop database; update configuration
  leopardo-sql init                              Initializes project
  leopardo-sql init:config                       Initializes configuration
  leopardo-sql init:migrations                   Initializes migrations
  leopardo-sql init:models                       Initializes models
  leopardo-sql init:seeders                      Initializes seeders
  leopardo-sql generate:migration                Generates a new migration file
  leopardo-sql generate:model                    Generates a model and its migration
  leopardo-sql generate:seed                     Generates a new seed file

Options:
  --version  Show version number
  --help     Show help`

const initCommands = ['init', 'init:config', 'init:migrations', 'init:models', 'init:seeders']
const generateCommands = ['generate:migration', 'generate:model', 'generate:seed']
const dbCommands = [
  'db:migrate',
  'db:migrate:undo',
  'db:migrate:undo:all',
  'db:seed',
  'db:seed:undo',
  'db:seed:all',
  'db:seed:undo:all',
  'db:create',
  'db:drop'
]

function folder(folderName, fileName, endName) {
  endName = endName === undefined ? fileName : endName
  const folderPath = path.join(__dirname, '..', '..', '..', folderName)

  const args = process.argv.slice(2)
  let tableName
  if (args[1] === '--name' && args[2]) {
    if ((folderName === 'migrations', fileName === 'create.js')) {
      tableName = `${args[2]}s`
    } else if ((folderName === 'models', fileName === 'index.js')) {
      tableName = `${args[2]}`
    }
  }

  fs.mkdir(folderPath, { recursive: true }, (err) => {
    if (err) {
      console.error('Error creating folder:', err)
    }
  })
  if (fileName !== undefined) {
    const sourcePath = path.join(__dirname, folderName, fileName)
    const destinationPath = path.join(folderPath, endName)
    fs.readFile(sourcePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err)
        return
      }

      const replacedData = data.replace(/#tableName#/g, tableName) // Replace 'your_table_name' with the actual table name

      fs.writeFile(destinationPath, replacedData, (err) => {
        if (err) {
          console.error('Error writing file:', err)
          return
        }
      })
    })
  }
  if (folderName === 'config') {
    console.log('Created "config\\config.json"')
  } else {
    console.log(`Successfully created ${folderName} folder at "${folderPath}".`)
  }
}

function executeSQL(folderName, command) {
  const folderPath = path.join(__dirname, '..', '..', '..', folderName)

  // Read all files in the folder
  fs.readdir(folderPath, async (err, files) => {
    if (err) {
      console.error('Error reading folder:', err)
      return
    }
    const migrations = await SQL.select('migrationlog')

    // Log all file names in the folder
    files.forEach(async (file) => {
      const isFileIncluded = migrations.some((migration) => migration.name === file)
      if (isFileIncluded) {
        console.log(`${file} is included in the migrations array.`)
      } else {
        await SQL.insertRow('migrationlog', { name: file })
        const filePath = path.join(folderPath, file)
        const { up, down } = require(filePath)
        if (command === 'up') {
          up()
        } else if (command === 'down') {
          down()
        }
        console.log(`${file} is not included in the migrations array.`)
      }
    })
  })
}

function initScript(args) {
  const command = args[0]
  switch (command) {
    case 'init':
      folder('config', 'config.json')
      folder('migrations')
      folder('models', 'index.js')
      folder('seeders')
      break
    case 'init:config':
      folder('config', 'config.json')
      break
    case 'init:migrations':
      folder('migrations')
      break
    case 'init:models':
      folder('models', 'index.js')
      break
    case 'init:seeders':
      folder('seeders')
      break
  }
}

function generateScript(args) {
  let name
  let modelName
  const argsName = String(args.slice(2))
  if (args[1] === '--name' && args[2]) {
    const argsNames = String(args.slice(2))
    const argsName = argsNames.replace(/,/g, '-')
    if (args[0] === 'model:generate') {
      name = `${timestamp()}-create-${argsName}.js`
      modelName = `${argsName}.js`
    } else {
      name = `${timestamp()}-${argsName}.js`
    }
  }
  const command = args[0]
  switch (command) {
    case 'migration:generate':
      folder('migrations', 'index.js', name)
      break
    case 'model:generate':
      folder('migrations', 'create.js', name)
      folder('models', 'index.js', modelName)
      break
    case 'seed:generate':
      folder('seeders', 'index.js', name)
      break
  }
}

function dbScript(args) {
  const command = args[0]
  switch (command) {
    case 'db:migrate':
      executeSQL('migrations', 'up')
      break
    case 'db:migrate:undo':
      executeSQL('migrations', '20240408230108-user', 'down')
      break
    case 'db:seed':
      executeSQL('seeders', '20240408230108-user', 'up')
      break
    case 'db:seed:undo':
      executeSQL('seeders', '20240408230108-user', 'down')
      break
    case 'db:create':
      SQL.createDatabase()
      break
    case 'db:drop':
      SQL.dropDatabase()
      break
  }
}

function scripts() {
  const title = `${underline}Leopardo SQL [Node: ${nodeV}, CLI/ORM: ${leopardoV}]${reset}`
  console.log('\n' + title + '\n')
  const args = process.argv.slice(2)
  if (initCommands.includes(args[0])) {
    initScript(args)
  } else if (generateCommands.includes(args[0])) {
    generateScript(args)
  } else if (dbCommands.includes(args[0])) {
    dbScript(args)
  } else {
    console.error(commandHelper)
    process.exit(1)
  }
}

scripts()
