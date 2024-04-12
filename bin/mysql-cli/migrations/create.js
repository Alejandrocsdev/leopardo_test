const { SQL } = require('leopardo')

module.exports = {
  async up() {
    SQL.createTable('#tableName#', {
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
    })
  },
  async down() {
    SQL.dropTable('#tableName#')
  }
}
