'use strict'
const Convert = require('./convert')
const fs = require('fs')
const cv = require('opencv')
const imagemagick = require('imagemagick')
const path = require('path')
const kaohameFileName = (process.argv[3]).split('/')[1]

module.exports = (kaoImgFileName) => (face, _features) => (out) => {
  const randPath = '' +Date.now() + Math.floor(Math.random() * 100000)
  require('mkdirp').sync('/tmp/' + randPath)
  const wstream = fs.createWriteStream('/tmp/'+ randPath +'/result.png')
  wstream.write(out)
  wstream.end()
  // 顔の写った画像はリサイズしてサイズを合わせて顔をマスクする
  imagemagick.identify(kaoImgFileName, (err, features) => {
    cv.readImage(kaoImgFileName, function (err, im) {
      im.detectObject(cv.FACE_CASCADE, {}, function (err, thisFaces) {
        const thisFace = thisFaces[0]
        const rate = (face.width / thisFace.width)
        const resize = new Convert(['-resize', `${im.width() * rate}x`, '-', '-'])
        const imMask = new Convert([
          '-size', `${im.width()}x${im.height()}`,
          'xc:black', '-fill', 'white',
          '-draw', `circle ${(thisFace.x + thisFace.width/2)},${(thisFace.y + thisFace.height/2)} ${(thisFace.x+thisFace.width/2)},${(thisFace.y +thisFace.height)}`,
          features.format+':-'
        ])
        const imOpacityComposite = new Convert([
          kaoImgFileName, '-', '-compose', 'CopyOpacity', '-composite', 'png:-'
        ])
        imMask.pipe(imOpacityComposite).pipe(resize).closed((out) => {
          const wstream = fs.createWriteStream('/tmp/' + randPath + '/result2.png')
          wstream.write(out)
          wstream.end()
          const x = face.x - thisFace.x * rate
          const y = face.y - thisFace.y * rate
          const pos = `${x>=0?'+':''}${x}${y>=0?'+':''}${y}`
          const bgImg = new Convert(['-size', `${_features.width}x${_features.height}`, 'xc:none', 'png:-'])
          const imComposite = new Convert([
            '-', '/tmp/' + randPath + '/result2.png', '-geometry', pos, '-composite', '-'
          ])
          const imComposite2 = new Convert([
            '/tmp/' + randPath + '/result.png', '-', '-gravity', 'northeast', '-composite', features.format+':-'
          ])
          bgImg.pipe(imComposite).pipe(imComposite2).closed((out) => {
            const wstream = fs.createWriteStream(process.argv[4])
            wstream.write(out)
            wstream.end()
          })
        })
      })
    })
  })
}
