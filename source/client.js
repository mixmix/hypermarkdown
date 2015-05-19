var xhr = require('xhr')
var dom = require('domquery')

var treeToHtml = require('../treeToHtml')

var current_url = window.location.href
var current_path = current_url.replace(/.*(herokuapp\.com|localhost\:\d*)/, '')

if (current_path == '/') {
  dom('#loading').style({'display': 'none'})
  dom('#how-to').removeClass('hide')
  //dom('body main .container.target').replace('#loading', '<div></div>')
} else {
  xhr({
    uri: '/api/render?source=' + current_path,
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
