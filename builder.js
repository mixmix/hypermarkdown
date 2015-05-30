var async = require('async')
var request = require('request');


module.exports = function( url, callback ) {
  var parentTree = Tree(url)
  parentTree.depth = 0

  dig( parentTree, callback )
}

if (!module.parent) {
  var url = 'http://github.com/mixmix/example-course/blob/master/mix-recipe.md'

  module.exports(url, function (err, results) {
    if (err) { throw err }
    var renderedTree = renderTreeContent(results)
    console.log(renderedTree)
    console.log(treeToHtml(renderedTree))
  })
}

function Tree(url) { 
  return {
    parent:   null,
    depth:    null,
    source:   url,
    content:  null,
    children: null,
  }
}

function dig( treeNode, callback ) {
  if (isInfiniteLoop(treeNode)) return callback(null, treeNode)

  console.log( Array(treeNode.depth*2).join(' ') + green('[Get] ') + treeNode.source)
  request.get( make_raw(treeNode.source), function(err, response, body) {
    if (err) {
      console.error("there was an error getting: " + url)
      return callback(err)
    }

    treeNode.content = body
    treeNode.children = find_transclusion_urls(body).map( Tree )
    // TODO move into Tree()
    treeNode.children.forEach(function (childTree) {
      childTree.parent = treeNode
      childTree.depth  = treeNode.depth + 1
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
  if (tree.parent == null) return false
  if (url == null) {
    return isInfiniteLoop( tree.parent, tree.source )
  }

  if (tree.source === url) return true

  return isInfiniteLoop ( tree.parent, url )
}

function green(string) { return ("\033[32m"+ string +"\033[0m") }

function make_raw( url ) {
  if (url.match(/github\.com/)) {
    url = url.replace(/\/blob\//, '/raw/')
  }
  return url
}


function find_transclusion_urls(text) {
  var link_pattern_matches = text.match(/\+\[[^\[\]]*\]\([^\)]+\)/g)
    
  if (link_pattern_matches) {
    return link_pattern_matches.map(strip_to_url) 
  } else {
    return []
  }
}

function stripHyperMarkdownBadge(text) {
  return text.replace('[![](https://github.com/mixmix/hypermarkdown/raw/master/hypermarkdown_badge.png)](https://hypermarkdown.herokuapp.com)', '')
}

function strip_to_url(string) {
  return string.replace(/(.*\(|\).*)/g, '')
}

