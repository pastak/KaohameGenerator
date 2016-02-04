'use strict'
const exec = require('child_process').exec
const path = require('path')
const fs = require('fs')
const mkdirp = require('mkdirp')

module.exports = function *(next) {
  const koa = this
  const dirPath = path.resolve(__dirname, `../static/img/${this.state.md5}`)
  let files
  try {
    mkdirp.sync(dirPath)
    files = yield (cb) => fs.readdir(path.join(__dirname, '../kaohamepanels'), cb)
  } catch (e) {
    return this.throw(e)
  }
  const startTime = Date.now()
  let count = 0
  return yield files.map(function *(file) {
    count++
    const resultFilePath = `result${count}.png`
    return yield (cb) => exec(`node bin/index.js ${koa.state.path} ../kaohamepanels/${file} ${dirPath}/${resultFilePath}`, (err, stdout, stderr) => {
      const endTime = Date.now()
      cb(err, {filePath: resultFilePath, time: endTime - startTime})
    })
  })
}
