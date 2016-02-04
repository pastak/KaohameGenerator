'use strict'
const Koa = require('koa')
const app = new Koa()
const serve = require('koa-static')
const router = require('koa-router')()
const bodyParser = require('koa-body')
const md5 = require('md5')
const fs = require('fs')
const generateImage = require('./libs/generateImg')

router.post('/generate', bodyParser({multipart: true}), function *(next) {
  this.type = 'application/json'
  const uploadPhoto = this.request.body.files.photo
  const uploadPhotoPath = uploadPhoto.path
  let fileData
  try {
    fileData = yield (cb) => fs.readFile(uploadPhotoPath, cb)
  } catch (e) {
    this.status = 500
    return this.body = JSON.stringify({error: e})
  }
  const fileMd5 = md5(fileData)
  this.state.md5 = fileMd5
  this.state.path = uploadPhotoPath
  try {
    let result = yield next
    result = Object.assign({results: result}, {md5: fileMd5})
    this.body = result
  } catch (e) {
    this.status = 500
    console.log(e)
    this.body = e
  }
}, generateImage)

app.use(router.routes())
app.use(serve('./static'))

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
