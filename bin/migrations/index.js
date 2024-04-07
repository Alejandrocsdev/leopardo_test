const sql = require('../../mysql')

sql.script(
  () =>
    sql.createTable(name, {
      id: {
        Type: 'INT',
        Key: 'PRIMARY KEY',
        Default: 'AUTO_INCREMENT'
      },
      // name: {
      //   Type: 'VARCHAR(255)',
      //   Null: 'NOT NULL',
      //   Key: '',
      //   Default: '',
      //   Extra: ''
      // },
      createdAt: {
        Type: 'TIMESTAMP',
        Default: 'DEFAULT CURRENT_TIMESTAMP'
      },
      updatedAt: {
        Type: 'TIMESTAMP',
        Default: 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
      }
    }),
  () => sql.dropTable(name)
)
