const { SQL } = require('leopardo')

module.exports = {
  async up() {
    // Add seed commands here.
    // Example:
    // SQL.bulkInsert('users', [{
    //   name: 'John Doe',
    //   age: 18
    // }])
  },
  async down() {
    // Add commands to revert seed here.
    // Example:
    // SQL.bulkDelete('users');
  }
}
