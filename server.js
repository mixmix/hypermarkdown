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
  if (referer.match(mdRegex)) {
    res.writeHead(302, {'Location': 'http://hypermarkdown.herokuapp.com/?source=' + referer, })
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

  if (source && source.match(mdRegex) ) {
    var target = make_raw(source)

    build(target, function(err, tree) {
      if (err) { 
        res.writeHead(400, {'content-type': 'text/plain'})
        res.write("You've hit a bad url somewhere in there, we got the error:<br />"+ err)
        res.end()
        return
      }

      res.writeHead(200, {'content-type': 'application/json'})

      var renderedTree = renderTree(tree)
      res.write( stringify(renderedTree, null, 2) )
      res.end()
    })
  }
  else {
    res.writeHead(400, {'content-type': 'text/plain'})
    res.write("You need to provide a link to a markdown file. <br />Check you're using the format <strong>/?source=address_to_file.md</strong> or <strong>/api/render/?source=address_to_file.md</strong> if you're using the API")
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

var mdRegex = new RegExp(/\.h?md(\#[-_\w]*)?/)


function startServer() {
  var port = process.env.PORT || 5000
  http.createServer( handler ).listen(port)
}

function keepAwake() {
  setInterval(
    function() {
      console.log('POKE')
      http.get("http://hypermarkdown.herokuapp.com");
    }, 
    300000 // every 5 minutes (300000)
  ) 
}

startServer()
keepAwake()

