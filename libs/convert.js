'use strict'
const child_process = require('child_process')
const spawn = child_process.spawn

const Convert = function (args) {
  this.command = spawn('convert', args)
  this.stdout = new Buffer('')
  this.command.stdout.on('data', (data) => {
    this.stdout = Buffer.concat([this.stdout, data])
  })
  return this
}

Convert.prototype.pipe = function (pipedConvert, returnSelf) {
  this.command.on('close', () => {
    pipedConvert.command.stdin.end()
  })
  this.command.stdout.on('data', function (data) {
    pipedConvert.write(data)
  })
  return returnSelf ? this : pipedConvert
}

Convert.prototype.write = function (data) {
  this.command.stdin.write(data)
}

Convert.prototype.closed = function (cb) {
  this.command.on('close', () => {
    if (cb) {
      cb(this.stdout)
    }
  })
}

module.exports = Convert
