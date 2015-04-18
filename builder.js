var async = require('async')
var request = require('request');
var Markdown = require('markdown-it')

var md = new Markdown()

module.exports = function build( text, callback ) { 
  var links = find_transculsion_links(text)
  if (links == null) { 
    return callback(null, md.render(text))
  }

  async.each( links, 
              function get_md( link, throw_err ) { 
                var raw_url = make_raw(link)
                request.get(raw_url, function(err, response, body) {
                  if (err) throw_err("there was an error getting: " + link)

                  console.log(" [Get] "+ link)
                  text = substitute(link, body, text)

                  throw_err()
                })
              },
              function recur(err) {
                if (err) throw err
                console.log('DONE fetching')
                //console.log(text)

                build(text, callback)
              }
  )
}

function make_raw( url ) {
  return url.replace(/.*api\/render\//, 'https://github.com/').replace(/\/blob\//, '/raw/')
}

function find_transculsion_links(text) {
  var link_pattern_matches = text.match(/\+\[[\w\s]*\]\([^\)]+\)/g)
    
  if (link_pattern_matches) {
    return link_pattern_matches.map(strip_to_link) 
  } else {
    return null
  }
}

function throw_err(err) {
  if (err) throw err
}

function strip_to_link(string) {
  return string.replace(/(.*\(|\).*)/g, '')
}

function substitute(link, imported_text, whole_text) {
  var regex = new RegExp('\\+\\[.*\\]\\(' + link + '\\)', 'g')
  return whole_text.replace(regex, imported_text)
}


