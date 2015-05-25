var url = require('url')
var xhr = require('xhr')
var dom = require('domquery')

var treeToHtml = require('../treeToHtml')

var requestDetails = url.parse(window.location.href, true)
var source = requestDetails.query.source
var mode = requestDetails.query.style

var mdRegex = new RegExp(/\.h?md(\#[-_\w]*)?/)

if (source) {
  xhr({
    uri: '/api/render?source=' + source,
    headers: {
      "Content-Type": "application/json"
    }
  }, renderResponse)
}
else {
  dom('#loading').style({'display': 'none'})
  dom('#how-to').removeClass('hide')
}

function renderResponse (err, resp, body) {
  if (resp.statusCode == 400) {
    var insertContent = body
  }
  else {
    console.log(body)
    var results = JSON.parse(body)

    if (mode) {
      console.log('yeah!')
      var insertContent = treeToHtml.stitched(results)
    }
    else {
      var insertContent = treeToHtml.plain(results)
    }
  }

  dom('body main .container.target').replace('#loading', "<div class='markdown-body'>{insert}</div>", {insert: insertContent} )
}

