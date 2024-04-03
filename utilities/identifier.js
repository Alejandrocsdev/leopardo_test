// module.exports = (() => {
//   let counter = 0

//   return {
//     id: () => {
//       counter++
//       return String(counter)
//     }
//   }
// })()

let counter = 0

const identifier = {
  id: () => {
    counter++
    return String(counter)
  }
}

module.exports = identifier
