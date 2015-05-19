var isProd = process.env.NODE_ENV === 'production'
var http = require('http')
var fs = require('fs')
var request = require('request')
var stringify = require('safe-json-stringify') 

var build = require('./builder')
var renderTree = require('./renderTree')

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
  else if (req.url.match(/api\/render\/?\?source\=.*\.h?md/)) {
    //this pattern assumes you're mirroring a github repo/project location
    var target = make_raw(req.url)

    build(target, function(err, tree) {
      res.writeHead(200, {'content-type': 'application/json'})

      var renderedTree = renderTree(tree)
      res.write(stringify(renderedTree, null, 2))
      res.end()
    })
  }
  else if (req.url.match(/api\/authors\/?\?source\=.*\.h?md/)) {
    //this pattern assumes you're mirroring a github repo/project location
    var target = req.url.replace(/.*source\=/)

    getAuthors(target, function(err, authors) {
      res.writeHead(200, {'content-type': 'application/json'})

      res.write(stringify(authors, null, 2))
      res.end()
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
  return 'https://github.com/' + url.replace(/.*api\/render\/?\?source\=/, '').replace(/\/blob\//, '/raw/')
}


function startServer() {
  var port = process.env.PORT || 5000
  http.createServer( handler ).listen(port)
}

startServer()
