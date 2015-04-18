var xhr = require('xhr')
var dom = require('domquery')

var current_url = window.location.href
var current_path = current_url.replace(/.*(herokuapp\.com|localhost\:\d*)/, '')
var render_api = '/api/render' + current_path

if (current_path == '/') {
  dom('#loading').style({'display': 'none'})
  dom('#how-to').removeClass('hide')
  //dom('body main .container.target').replace('#loading', '<div></div>')
} else {
  xhr({
    uri: render_api,
    headers: {
        "Content-Type": "application/json"
    }
  }, function (err, resp, body) {
    var results = JSON.parse(body)

    dom('body main .container.target').replace('#loading', "<div class='markdown-body'>{body}</div>", results )
  })
}
