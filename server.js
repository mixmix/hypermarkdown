var isProd = process.env.NODE_ENV === 'production'
var http = require('http')
var fs = require('fs')
var request = require('request')

var build = require('./builder')

// routing: routes
// testing: tape

function handler(req, res) {
  if (req.url === '/') {

    var referer = req.headers.referer || ''
    if (referer.match(/github.*\.h?md/)) {
      var redirect = referer.replace(/.*github.com/, '')
      res.writeHead(302, {'Location': redirect, })
      res.end()
    } else {
      res.writeHead(200, {'content-type': 'text/html'})
      fs.createReadStream('./index.html').pipe(res)
    }
  }
  else if (req.url === '/app.js') {
    fs.createReadStream('./build/client.js').pipe(res)
  }
  else if (req.url === '/styles.css') {
    fs.createReadStream('./styles.css').pipe(res)
  }
  else if (req.url === '/loading.gif') {
    fs.createReadStream('./loading.gif').pipe(res)
  }
  else if (req.url.match(/api\/render\/.*\.h?md/)) {
    //this pattern assumes you're mirroring a github repo/project location
    var target = make_raw(req.url)

    request.get( target, function(err, response, body) {
      build(body, function(err, rendered_hypermarkdown) {
        res.writeHead(200, {'content-type': 'application/json'})

        res.write(JSON.stringify({body: rendered_hypermarkdown}, null, 2))
        res.end()
      })
    })
  }
  else {
    res.writeHead(200, {'content-type': 'text/html'})
    fs.createReadStream('./index.html').pipe(res)

    //res.writeHead(404)
    //res.end()
  }

}

function make_raw( url ) {
  return 'https://github.com/' + url.replace(/.*api\/render\//, '').replace(/\/blob\//, '/raw/')
}

function startServer() {
  var port = process.env.PORT || 5000
  http.createServer( handler ).listen(port)
}

startServer()
