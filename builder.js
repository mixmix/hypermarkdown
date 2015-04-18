var async = require('async')
var request = require('request');

module.exports = build 


function build( text, callback ) { 
  var links = find_transculsion_links(text)
  if (links == null) { 
    console.log('here')
    //console.log(text)
    return callback(null, text)
  }

  async.each( links, 
              function get_md( link, throw_err ) { 
                request.get(link, function(err, response, body) {
                  if (err) throw_err("there was an error getting: " + link)

                  console.log("Get: "+ link)
                  text = substitute(link, body, text)

                  throw_err()
                })
              },
              function recur(err) {
                if (err) throw err
                console.log('end of async doing each')
                console.log(text)

                build(text, callback)
              }
  )
}


function find_transculsion_links(text) {
  var link_pattern_matches = text.match(/i\[[\w\s]*\]\([^\)]+\)/g)
    
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
  var regex = new RegExp('i\\[.*\\]\\(' + link + '\\)', 'g')
  return whole_text.replace(regex, imported_text)
}


