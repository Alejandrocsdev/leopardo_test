// MODULE
const path = require('path')
const fs = require('fs')
// TEMPLATE PATH
const views = path.resolve(__dirname, '..', '..', '..', 'views')
const layouts = path.resolve(views, 'layouts')

function engine(file, data) {
  return new Promise((resolve, reject) => {
    const content = fileContent(file)
    let main = fileContent('main')
    main = main.replace(/\{\{\{body\}\}\}/g, content)

    const eachRegexp = /\{\{#each ([^}]+)\}\}[\s\S]*?\{\{\/each\}\}/
    const ifRegexp = /\{\{#if ([^}]+)\}\}[\s\S]*?\{\{\/if\}\}/
    const strRegexp = /\{\{(\w+)\}\}/g
    const objRegexp = /\{\{(\w+)\.(\w+)\}\}/g

    let continueReplacing = true

    while (continueReplacing) {
      continueReplacing = false

      if (eachRegexp.test(main) && data !== undefined) {
        main = eachHelper(main, eachRegexp, data)
        continueReplacing = eachRegexp.test(main) ? true : false
      }

      if (ifRegexp.test(main)) {
        main = ifHelper(main, ifRegexp, data)
        continueReplacing = ifRegexp.test(main) ? true : false
      }

      if (strRegexp.test(main)) {
        main = main.replace(strRegexp, (match, str) => {
          return data[str] !== undefined ? data[str] : ''
        })
        continueReplacing = true
      }

      if (objRegexp.test(main)) {
        main = main.replace(objRegexp, (match, obj, key) => {
          return data?.[obj]?.[key] ?? ''
        })
        continueReplacing = true
      }
    }

    resolve(main)
  })
}

function fileContent(file) {
  let filePath = ''
  if (file === 'main') {
    filePath = path.resolve(layouts, `${file}.html`)
  } else {
    filePath = path.resolve(views, `${file}.html`)
  }
  return fs.readFileSync(filePath, 'utf8')
}

function eachHelper(main, eachRegexp, data) {
  const variable = main.match(eachRegexp)[1]
  console.log('data: ', data)
  console.log('variable: ', variable)
  console.log('data[variable]: ', data[variable])
  const iterateCount = data[variable].length
  const startIndex = main.indexOf(`{{#each ${variable}}}`) + `{{#each ${variable}}}`.length
  const endIndex = main.indexOf('{{/each}}')
  const eachContent = main.substring(startIndex, endIndex)
  const contentStart = main.substring(0, startIndex - `{{#each ${variable}}}`.length)
  const contentEnd = main.substring(endIndex + '{{/each}}'.length)
  const replacedContent = []
  for (let i = 0; i < iterateCount; i++) {
    let tempContent = eachContent.replace(/\{\{this\.(\w+)\}\}/g, (match, key) => {
      return data[variable][i][key]
    })
    replacedContent.push(tempContent)
  }
  return contentStart + replacedContent.join('') + contentEnd
}

function ifHelper(main, ifRegexp, data) {
  const variable = main.match(ifRegexp)[1]
  const openStart = main.indexOf(`{{#if ${variable}}}`)
  const openEnd = openStart + `{{#if ${variable}}}`.length
  const closeStart = main.indexOf('{{/if}}', openEnd)
  const closeEnd = closeStart + '{{/if}}'.length

  if (data !== undefined && data[variable]) {
    return (
      main.substring(0, openStart) + main.substring(openEnd, closeStart) + main.substring(closeEnd)
    )
  } else {
    return main.substring(0, openStart) + main.substring(closeEnd)
  }
}

module.exports = engine
