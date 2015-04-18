var xhr = require('xhr')
var dom = require('domquery')

var render_api = '/api/render' + window.location.href.replace(/.*(herokuapp\.com|localhost\:\d*)/, '')


xhr({
    uri: render_api,
    headers: {
        "Content-Type": "application/json"
    }
}, function (err, resp, body) {
  var results = JSON.parse(body)

  dom('body main').replace('#dump', "<div>{body}</div>", results )
})


