'use strict'
const Convert = require('./convert')
const fs = require('fs')
const cv = require('opencv')
const imagemagick = require('imagemagick')

const maskCircle = (fileName, format, imageSize, circle, reverse, cb) => {
  let maskColor = ['black', 'white']
  if (reverse) {
    maskColor.reverse()
  }
  const imMask = new Convert([
    '-size', `${imageSize[0]}x${imageSize[1]}`,
    'xc:' + maskColor[0], '-fill', maskColor[1],
    '-draw', `circle ${circle[0]},${circle[1]} ${circle[2]},${circle[3]}`,
    format + ':-'
  ])
  const imComposite = new Convert([
    fileName, '-', '-compose', 'CopyOpacity', '-composite', 'png:-'
  ])
  if (!cb) {
    return imMask.pipe(imComposite, true)
  }
  imMask.pipe(imComposite).closed(cb)
}

module.exports = maskCircle
