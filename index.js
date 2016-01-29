'use strict'
// node . face kaohame
const Convert = require('./libs/convert')
const fs = require('fs')
const cv = require('opencv')
const path = require('path')
const imagemagick = require('imagemagick')
const maskCircle = require('./libs/maskCircle')
const kaohameReciever = require('./libs/kaohameReciever')(path.resolve(__dirname, process.argv[2]))

const kaohameFileName = path.resolve(__dirname, process.argv[3])
// まず顔はめパネル画像を読み込んで顔部分を切り抜く
imagemagick.identify(kaohameFileName, (err, features) => {
  cv.readImage(kaohameFileName, function(err, im) {
    im.detectObject(cv.FACE_CASCADE, {}, function (err, faces) {
      const face = faces[0]
      maskCircle(
        kaohameFileName,
        features.format,
        [im.width(), im.height()],
        [face.x + face.width/2, face.y + face.height/2, face.x+face.width/2, face.y +face.height],
        true,
        kaohameReciever(face, features)
      )
    })
  })
})
