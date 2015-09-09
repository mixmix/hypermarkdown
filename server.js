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
var fetchAuthors = require('./fetchAuthors')

// testing: tape

router.addRoute('/', rootRequestResponse)
function rootRequestResponse(req, res, match) {
  var referer = req.headers.referer || ''
  //linked from an md file?
  if (referer.match(mdRegex)) {
    res.writeHead(302, {'Location': 'http://hyper.mixmix.io/?source=' + referer, })
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
    build(source, function(err, tree) {
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

router.addRoute('/api/authors', authorsResponse)
function authorsResponse(req, res, match) {
  var requestDetails = url.parse(req.url, true)
  var source = requestDetails.query.source

  if (source && source.match(mdRegex) && source.match(githubRegex)) {
    var ownerAndRepo = source.match(/.*github.com\/([\w-_]+\/[\w-_]+)/)[1]
    // this path assumes a lot about the source provided
    var path = source.match(/.*github.com\/[\w-_]+\/[\w-_]+\/(.*\.md)/)[1].replace('blob/master/', '')

    fetchAuthors(ownerAndRepo, {path: path}, function(err, users) {
      if (err) { 
        res.writeHead(400, {'content-type': 'text/plain'})
        res.write("You've hit a bad url somewhere in there, we got the error:<br />"+ err)
        res.end()
        return
      }

      console.log(users)
      res.writeHead(200, {'content-type': 'application/json'})

      res.write( stringify(users, null, 2) )
      res.end()
    })
  }
  else {
    res.writeHead(400, {'content-type': 'text/plain'})
    res.write("error or no easy way to determine authors")
    res.end()
  }
}


function handler(req, res) {
  var requestDetails = url.parse(req.url, true)
  var match = router.match(requestDetails.pathname)
  if (match) {
    match.fn(req, res, match)
  }
  // static-resources:
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

var mdRegex = new RegExp(/\.h?md(\#[-_\w]*)?/)
var githubRegex = new RegExp(/github\.com/)


function startServer() {
  var port = process.env.PORT || 5000
  http.createServer( handler ).listen(port)
}

function keepAwake() {
  setInterval(
    function() {
      console.log('POKE')
      http.get("http://hyper.mixmix.io");
    }, 
    300000 // every 5 minutes (300000)
  ) 
}

startServer()
keepAwake()

