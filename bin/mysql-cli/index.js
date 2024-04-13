// module
const fs = require('fs')
const path = require('path')
const pluralize = require('pluralize')
// Mysql
const SQL = require('../../mysql')
// utility
const timestamp = require('../../utilities/timestamp')
const colors = require('../../utilities/color')
// color
const red = colors.red
const blue = colors.blue
const underline = colors.underline
const reset = colors.reset
// version
const leopardoV = require('leopardo/package.json').version
const nodeV = process.version.substring(1)
// help message
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

// command type
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

function initFolder(folderName, fileName) {
  const folderDest = path.join(__dirname, '..', '..', '..', '..', folderName)

  if (!fs.existsSync(folderDest)) {
    fs.mkdir(folderDest, (err) => {
      if (err) {
        console.log(`${red}ERROR:${reset} Fail to create folder.`)
      } else {
        console.log(
          `Successfully created ${blue}${folderName}${reset} folder at ${blue}${folderDest}${reset}.`
        )
      }
    })
  } else {
    console.log(`The folder at ${red}${folderDest}${reset} already exists.`)
  }

  if (fileName) {
    const fileSrc = path.join(__dirname, folderName, fileName)
    const fileDest = path.join(folderDest, fileName)

    if (!fs.existsSync(fileDest)) {
      fs.copyFile(fileSrc, fileDest, (err) => {
        if (err) {
          console.log(`${red}ERROR:${reset} Fail to create file.`)
          return
        }
        console.log(
          `Successfully created ${blue}${fileName}${reset} file at ${blue}${fileDest}${reset}.`
        )
      })
    } else {
      console.log(`The file at ${red}${fileDest}${reset} already exists.`)
    }
  }
}

function generateFile(folderName, fileName, fileEndName) {
  const folderDest = path.join(__dirname, '..', '..', '..', '..', folderName)
  const args = process.argv.slice(2)

  if (!args[1] || args[1] !== '--name') {
    console.log(`${red}ERROR:${reset} Missing attribute: --name.`)
    process.exit(1)
  } else if (args[1] === '--name' && args[2] && !args[3]) {
    const argsNames = String(args.slice(2))
    const argsName = argsNames.replace(/,/g, '-')
    if (args[0] === 'generate:model') {
      name = `${timestamp()}-create-${argsName}.js`
      modelName = `${argsName}.js`
    } else {
      name = `${timestamp()}-${argsName}.js`
    }
  } else {
    console.log(`${red}ERROR:${reset} Invalid command.`)
    process.exit(1)
  }

  if (!fs.existsSync(folderDest)) {
    fs.mkdir(folderDest, (err) => {
      if (err) {
        console.log(`${folderDest} doesn't exists.`)
        console.log(`${red}ERROR:${reset} Fail to create folder.`)
      }
    })
  }

  fileEndName = fileEndName === undefined ? fileName : fileEndName
  const fileSrc = path.join(__dirname, folderName, fileName)
  const fileDest = path.join(folderDest, fileEndName)
  fs.readFile(fileSrc, 'utf8', (err, data) => {
    if (err) {
      console.log(`${red}ERROR:${reset} Fail to read file.`)
      return
    }

    const modelName = args[2]
    const tableName = pluralize(modelName)
    // let name
    // if ((folderName === 'migrations', fileName === 'create.js')) {
    //   name = tableName
    // } else if ((folderName === 'models', fileName === 'index.js')) {
    //   name = modelName
    // }

    const replacedData = data
      .replace(/`/g, '') // Remove backticks from beginning and end
      .replace(/#(tableName|modelName)#/g, (match, group) => {
        if (group === 'tableName') {
          return tableName
        } else if (group === 'modelName') {
          return modelName
        }
        return match // Return the original match if no replacement is needed
      })

    let result
    switch (folderName) {
      case 'migrations':
        result = 'migration'
        break
      case 'models':
        result = 'model'
        break
      case 'seeders':
        result = 'seed'
        break
    }

    fs.writeFile(fileDest, replacedData, (err) => {
      if (err) {
        console.error(`${red}ERROR:${reset} Fail to write file.`)
        return
      } else {
        console.log(`New ${result} was created at ${blue}${fileDest}${reset}.`)
      }
    })
  })
}

async function migration(command) {
  const folderPath = path.join(__dirname, '..', '..', '..', '..', 'migrations')
  SQL.constructor.enableLogging = false

  try {
    const count = await SQL.checkLog(false)

    if (count === 0 && command === 'db:migrate') {
      await SQL.createTable('migrationlog', { name: { Type: 'VARCHAR(255)', Null: 'NOT NULL' } })
    }

    const files = await fs.promises.readdir(folderPath)

    const migrations = await SQL.select('migrationlog', false)

    if (command === 'db:migrate') {
      let notIncluded = 0
      for (const file of files) {
        const isIncluded = migrations.some((migration) => migration.name === file)
        if (!isIncluded) {
          notIncluded++
          await SQL.insertRow('migrationlog', { name: file })
          const filePath = path.join(folderPath, file)
          const { up } = require(filePath)
          console.log('\n' + `== ${file}: migrating =======`)
          const start = performance.now()
          up()
          const end = performance.now()
          const duration = (end - start).toFixed(3)
          console.log(`== ${file}: migrated (${duration}s)`)
        }
      }
      if (notIncluded === 0) {
        console.log(`No migrations were executed, database schema was already up to date.`)
      }
    } else if (command === 'db:migrate:undo') {
      if (migrations.length === 0) {
        console.log('No executed migrations found.')
        process.exit(1)
      }
      const lastFile = migrations[migrations.length - 1].name
      const lastFilePath = path.join(folderPath, lastFile)
      const { down } = require(lastFilePath)
      if (files.includes(lastFile)) {
        console.log('\n' + `== ${lastFile}: reverting =======`)
        const start = performance.now()
        down()
        const end = performance.now()
        const duration = (end - start).toFixed(3)
        console.log(`== ${lastFile}: reverted (${duration}s)`)
        SQL.deleteLastRow('migrationlog')
        fs.unlink(lastFilePath, (err) => {
          if (err) {
            console.error('Error deleting file:', err)
            return
          }

          console.log('File deleted successfully')
        })
      }
    } else if (command === 'db:migrate:undo:all') {
      if (migrations.length === 0) {
        console.log('No executed migrations found.')
        process.exit(1)
      }
      for (const file of files) {
        const isIncluded = migrations.some((migration) => migration.name === file)
        if (isIncluded) {
          const filePath = path.join(folderPath, file)
          const { down } = require(filePath)
          console.log('\n' + `== ${file}: reverting =======`)
          const start = performance.now()
          down()
          const end = performance.now()
          const duration = (end - start).toFixed(3)
          console.log(`== ${file}: reverted (${duration}s)`)
          await SQL.deleteRow('migrationlog', { name: file })
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting file:', err)
              return
            }

            SQL.constructor.log('File deleted successfully')
          })
        } else if (!isIncluded) {
          console.log(`${red}ERROR:${reset} Unable to find migration: ${file}`)
        }
      }
    }
    SQL.endConnection()
  } catch (err) {
    console.error(`Failed to execute files: ${err}`)
  }
}

async function seed(command) {
  await SQL.init()
  const folderPath = path.join(__dirname, '..', '..', '..', '..', 'seeders')
  SQL.constructor.enableLogging = false
  const files = await fs.promises.readdir(folderPath)

  try {
    if (command === 'db:seed:all') {
      for (const file of files) {
        const filePath = path.join(folderPath, file)
        const { up } = require(filePath)
        console.log('\n' + `== ${file}: migrating =======`)
        const start = performance.now()
        await up()
        const end = performance.now()
        const duration = (end - start).toFixed(3)
        console.log(`== ${file}: migrated (${duration}s)`)
      }
    }
    SQL.endConnection()
  } catch (err) {
    console.error(`Failed to execute files: ${err}`)
  }
}

function initScript(args) {
  const command = args[0]
  switch (command) {
    case 'init':
      initFolder('config', 'config.json')
      initFolder('migrations')
      initFolder('models', 'index.js')
      initFolder('seeders')
      break
    case 'init:config':
      initFolder('config', 'config.json')
      break
    case 'init:migrations':
      initFolder('migrations')
      break
    case 'init:models':
      initFolder('models', 'index.js')
      break
    case 'init:seeders':
      initFolder('seeders')
      break
  }
}

function generateScript(args) {
  let name
  let modelName

  if (args[1] === '--name' && args[2] && !args[3]) {
    const argsNames = String(args.slice(2))
    const argsName = argsNames.replace(/,/g, '-')
    if (args[0] === 'generate:model') {
      name = `${timestamp()}-create-${argsName}.js`
      modelName = `${argsName}.js`
    } else {
      name = `${timestamp()}-${argsName}.js`
    }
  }
  const command = args[0]
  switch (command) {
    case 'generate:migration':
      generateFile('migrations', 'index.js', name)
      break
    case 'generate:model':
      generateFile('migrations', 'create.js', name)
      generateFile('models', 'table.js', modelName)
      break
    case 'generate:seed':
      generateFile('seeders', 'index.js', name)
      break
  }
}

function dbScript(args) {
  const command = args[0]
  switch (command) {
    case 'db:migrate':
      migration(command)
      break
    case 'db:migrate:undo':
      migration(command)
      break
    case 'db:migrate:undo:all':
      migration(command)
      break
    // case 'db:seed':
    //   seed(command)
    //   break
    // case 'db:seed:undo':
    //   seed(command)
    //   break
    case 'db:seed:all':
      seed(command)
      break
    // case 'db:seed:undo:all':
    //   seed(command)
    //   break
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

module.exports = scripts
