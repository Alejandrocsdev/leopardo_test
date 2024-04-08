// #!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const Mysql = require('../mysql')
const sql = new Mysql()

const commandHelper = `
\x1b[4m\x1b[34mLeopardo SQL\x1b[0m

leopardo-sql <command>

Commands:
  leopardo-sql db:migrate                        Run pending migrations
  leopardo-sql db:migrate:schema:timestamps:add  Update migration table to have timestamps
  leopardo-sql db:migrate:status                 List the status of all migrations
  leopardo-sql db:migrate:undo                   Reverts a migration
  leopardo-sql db:migrate:undo:all               Revert all migrations ran
  leopardo-sql db:seed                           Run specified seeder
  leopardo-sql db:seed:undo                      Deletes data from the database
  leopardo-sql db:seed:all                       Run every seeder
  leopardo-sql db:seed:undo:all                  Deletes data from the database
  leopardo-sql db:create                         Create database specified by configuration
  leopardo-sql db:drop                           Drop database specified by configuration
  leopardo-sql init                              Initializes project
  leopardo-sql init:config                       Initializes configuration
  leopardo-sql init:migrations                   Initializes migrations
  leopardo-sql init:models                       Initializes models
  leopardo-sql init:seeders                      Initializes seeders
  leopardo-sql migration:generate                Generates a new migration file
  leopardo-sql model:generate                    Generates a model and its migration
  leopardo-sql seed:generate                     Generates a new seed file

Options:
  --version  Show version number
  --help     Show help`

const commands = [
  'db:migrate',
  'db:migrate:schema:timestamps:add',
  'db:migrate:status',
  'db:migrate:undo',
  'db:migrate:undo:all',
  'db:seed',
  'db:seed:undo',
  'db:seed:all',
  'db:seed:undo:all',
  'db:create',
  'db:drop',
  'init',
  'init:config',
  'init:migrations',
  'init:models',
  'init:seeders',
  'migration:generate',
  'model:generate',
  'seed:generate'
]

function folder(foldername, filename) {
  const folderPath = path.join(__dirname, '..', '..', '..', foldername)

  fs.mkdir(folderPath, { recursive: true }, (err) => {
    if (err) {
      console.error('Error creating folder:', err)
    } else {
      console.log('Folder created successfully.')
    }
  })

  if (filename !== undefined) {
    const sourcePath = path.join(__dirname, foldername, filename)
    const destinationPath = path.join(folderPath, filename)

    fs.copyFile(sourcePath, destinationPath, (err) => {
      if (err) {
        console.error('Error copying file:', err)
        return
      }

      console.log('File copied successfully.')
    })
  }
}
const folderName = 'migrations'
const fileName = 'index.js'
const folderPath = path.join(__dirname, '..', '..', '..', folderName)
const filePath = path.join(folderPath, fileName)
const { up } = require(filePath)
up()

function script() {
  const args = process.argv.slice(2)
  if (!commands.includes(args[0])) {
    console.error(commandHelper)
    process.exit(1)
  }
  let name
  if (args[1] === '--name') {
    name = args[2]
  }
  const command = args[0]
  switch (command) {
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
    case 'init':
      folder('config', 'config.json')
      folder('migrations')
      folder('models', 'index.js')
      folder('seeders')
      break
    case 'db:create':
      sql.createDatabase(name)
      break
    case 'db:drop':
      sql.dropDatabase(name)
      break
    case 'migration:generate':
      folder('migrations', 'index.js')
      break
  }
}

// script()
