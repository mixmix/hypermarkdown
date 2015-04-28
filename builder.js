var async = require('async')
var request = require('request');
var Markdown = require('markdown-it')

var md = new Markdown()

//module.exports = function( url, callback ) {
  //console.log(green('[Get] ') + url)

  //request.get( url, function(err, response, body) {
    //build(body, callback)
  //})
//}

module.exports = function( url, callback ) {
  var parentTree = Tree(url)

  dig( parentTree, callback )
}

if (!module.parent) {
  var url = 'http://github.com/mixmix/example-course/blob/master/mix-recipe.md'

  module.exports(url, function (err, results) {
    if (err) { throw err }
    console.log(results)
  })
}

function Tree(url) { 
  return {
    source:   url,
    content:  null,
    children: null,
  }
}

function dig( treeNode, callback ) {
  if (isInfiniteLoop(treeNode)) return callback(null, treeNode)

  console.log(green('[Get] ') + treeNode.source)
  request.get( githubify(treeNode.source), function(err, response, body) {
    if (err) {
      console.error("there was an error getting: " + url)
      return callback(err)
    }

    treeNode.content = body
    treeNode.children = find_transclusion_urls(body).map( Tree )
    // TODO move into Tree()
    treeNode.children.forEach(function (childTree) {
      childTree.parent = treeNode
    })

    async.each( 
      treeNode.children,
      dig,
      function (err) {
        callback(err, treeNode)
      }
    )
  })
}

function isInfiniteLoop( tree, url ) {
  if (url == null) {
    return isInfiniteLoop( tree.parent, tree.source )
  }

  if (tree.parent == null) return false
  if (tree.source === url) return true

  return isInfiniteLoop ( tree.parent, url )
}

////////////////////

function build( text, callback, indent ) { 
  var urls = find_transclusion_urls(text)
  if (urls == null) { 
    text = stringHyperMarkdownBadge(text)
    return callback(null, md.render(text))
  }

  indent = (indent || '') + '  '
  async.each( urls, 
              function get_md( url, throw_err ) { 
                console.log(green('[Get] ') + indent + url)

                request.get(githubify(url), function(err, response, body) {
                  if (err) throw_err("there was an error getting: " + url)

                  text = substitute(url, body, text)

                  throw_err()
                })
              },
              function recur(err) {
                if (err) throw err

                build(text, callback, indent)
              }
  )
}

function green(string) { return ("\033[32m"+ string +"\033[0m") }

function githubify( url ) {
  return url.replace(/.*api\/render\//, 'https://github.com/').replace(/\/blob\//, '/raw/')
}

function find_transclusion_urls(text) {
  var link_pattern_matches = text.match(/\+\[[\w\s]*\]\([^\)]+\)/g)
    
  if (link_pattern_matches) {
    return link_pattern_matches.map(strip_to_url) 
  } else {
    return []
  }
}

function stringHyperMarkdownBadge(text) {
  return text.replace('[![](https://github.com/mixmix/hypermarkdown/raw/master/hypermarkdown_badge.png)](https://hypermarkdown.herokuapp.com)', '')
}

function throw_err(err) {
  if (err) throw err
}

function strip_to_url(string) {
  return string.replace(/(.*\(|\).*)/g, '')
}

function substitute(url, imported_text, whole_text) {
  var regex = new RegExp('\\+\\[.*\\]\\(' + url + '\\)', 'g')
  return whole_text.replace(regex, imported_text)
}


