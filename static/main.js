(function () {
  'use strict'
  const photoUpload = document.getElementById('photoUpload')
  photoUpload.addEventListener('change', function (event) {
     event.preventDefault()
     const request = new XMLHttpRequest()
     request.open("POST", '/generate')
     request.onreadystatechange = function () {
       if (request.readyState < 4) return
       const res = JSON.parse(request.responseText)
       if (res.results) {
         const resultArea = document.getElementById('resultArea')
         resultArea.innerHTML = ''
         const dirname = res.md5
         res.results.forEach(function (result) {
           const img = document.createElement('img')
           resultArea.appendChild(img)
           img.src = '/img/' + dirname + '/' + result.filePath
         })
       } else {
         console.error(res)
         alert('some error happened')
       }
     }
     request.send(new FormData(document.getElementById('form')))
  })
})()
