var url = require('url')
var xhr = require('xhr')
var dom = require('domquery')

var treeToHtml = require('../treeToHtml')

var requestDetails = url.parse(window.location.href, true)
var source = requestDetails.query.source

if (source) {
  xhr({
    uri: '/api/render?source=' + source,
    headers: {
        "Content-Type": "application/json"
    }
  }, function (err, resp, body) {
    console.log(body)
    var results = JSON.parse(body)

    var fullRenderedMarkdown = treeToHtml(results)
    dom('body main .container.target').replace('#loading', "<div class='markdown-body'>{body}</div>", {body: fullRenderedMarkdown} )
  })
}
else {

  dom('#loading').style({'display': 'none'})
  dom('#how-to').removeClass('hide')
  //dom('body main .container.target').replace('#loading', '<div></div>')
}

