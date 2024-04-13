const { SQL } = require('leopardo')

module.exports = {
  async up() {
    SQL.bulkInsert('#tableName#', {
      id: {
        Type: 'INT',
        Null: 'NOT NULL',
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
        Null: 'NOT NULL',
        Default: 'DEFAULT CURRENT_TIMESTAMP'
      },
      updatedAt: {
        Type: 'TIMESTAMP',
        Null: 'NOT NULL',
        Default: 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
      }
    })
  },
  async down() {
    SQL.bulkDelete('#tableName#')
  }
}
