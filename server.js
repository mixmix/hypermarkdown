var isProd = process.env.NODE_ENV === 'production'
var http = require('http')
var fs = require('fs')
var request = require('request')

var build = require('./builder')

// routing: routes
// testing: tape

var dataStore = {}

function handler(req, res) {
  if (req.url === '/') {
    res.writeHead(200, {'content-type': 'text/html'})
    fs.createReadStream('./index.html').pipe(res)
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
    var target = fix_url(req.url)

    request.get( target, function(err, response, body) {
      build(body, function(err, rendered_hypermarkdown) {
        res.writeHead(200, {'content-type': 'application/json'})

        console.log(rendered_hypermarkdown)
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

function fix_url( url ) {
  return 'https://github.com/' + url.replace(/.*api\/render\//, '').replace(/\/blob\//, '/raw/')
}

function startServer() {
  var port = process.env.PORT || 5000
  http.createServer( handler ).listen(port)
}

startServer()
