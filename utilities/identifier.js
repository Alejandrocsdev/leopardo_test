let counter = 0

const identifier = {
  // Generate a unique identifier
  id: () => {
    counter++
    return String(counter)
  }
}

module.exports = identifier
