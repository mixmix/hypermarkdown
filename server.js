var isProd = process.env.NODE_ENV === 'production'

var Router = require('routes')
var router = Router()
var http = require('http')
var url = require('url')
var fs = require('fs')
var request = require('request')
var stringify = require('json-stringify-safe') 

var build = require('./builder')
var renderTree = require('./renderTree')

// testing: tape

router.addRoute('/', rootRequestResponse)
function rootRequestResponse(req, res, match) {
  var referer = req.headers.referer || ''
  //linked from an md file?
  if (referer.match(/\.h?md(\#[-_\w]*)?/)) {
    res.writeHead(302, {'Location': '/?source=' + referer, })
    res.end()
  } 
  else {
    res.writeHead(200, {'content-type': 'text/html'})
    fs.createReadStream('./index.html').pipe(res)
  }
}

router.addRoute('/api/render', buildHypermarkdownTree)
function buildHypermarkdownTree(req, res, match) {
  var requestDetails = url.parse(req.url, true)
  var source = requestDetails.query.source

  if (source) {
    var target = make_raw(source)

    build(target, function(err, tree) {
      res.writeHead(200, {'content-type': 'application/json'})

      var renderedTree = renderTree(tree)
      res.write( stringify(renderedTree, null, 2) )
      res.end()
    })
  }
  else {
    res.writeHead(200, {'content-type': 'text/plain'})
    res.write('use format /api/render?source=address_to_md_file')
    res.end()
  }
}



function handler(req, res) {
  var requestDetails = url.parse(req.url, true)
  var match = router.match(requestDetails.pathname)
  if (match) {
    match.fn(req, res, match)
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
}

function make_raw( url ) {
  //return 'https://github.com/' + url.replace(/.*api\/render\/?\?source\=/, '').replace(/\/blob\//, '/raw/')
  if (url.match(/github\.com/)) {
    url = url.replace(/\/blob\//, '/raw/')
  }
  return url
}


function startServer() {
  var port = process.env.PORT || 5000
  http.createServer( handler ).listen(port)
}

startServer()
