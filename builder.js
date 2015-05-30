var async = require('async')
var request = require('request');


module.exports = function( url, callback ) {
  var parentTree = Tree({
    label: null,
    url: url,
    parent: null,
    depth: 0,
  })

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

function Tree( attrs ) {
  return {
    label:    attrs['label'],
    url:      attrs['url'],
    parent:   attrs['parent'],
    depth:    attrs['depth'],
    content:  null,
    children: null,
  }
}

function treeWithParent( treeNode ) {
  return function ( attrs ) {
    attrs.parent = treeNode
    attrs.detpth = treeNode.depth + 1

    return Tree( attrs )
  }
}

function dig( treeNode, callback ) {
  if (isInfiniteLoop(treeNode)) return callback(null, treeNode)

  //console.log( Array(treeNode.depth*2).join(' ') + green('[Get] ') + treeNode.url)
  request.get( make_raw(treeNode.url), function(err, response, body) {
    if (err) {
      console.error("there was an error getting: " + treeNode.url)
      return callback(err)
    }

    treeNode.content = body
    treeNode.children = findTransclusionLinks(body).map( treeWithParent(treeNode) )

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
    return isInfiniteLoop( tree.parent, tree.url )
  }

  if (tree.url === url) return true

  return isInfiniteLoop ( tree.parent, url )
}

function green(string) { return ("\033[32m"+ string +"\033[0m") }

function make_raw( url ) {
  if (url.match(/github\.com/)) {
    url = url.replace(/\/blob\//, '/raw/')
  }
  return url
}

function findTransclusionLinks(text) {
  //var link_pattern_matches = text.match(/\+  \[  [^\[\]]* \]     \(  ^\)]+ \)  /g)
  var link_pattern_matches = text.match(/\+\[[^\[\]]*\]\([^\)]+\)/g)
    
  if (link_pattern_matches) {
    return link_pattern_matches.map( seperateLabelAndLink ) 
  } else {
    return []
  }
}

function seperateLabelAndLink(string) {
  return {
    label: string.replace(/^\+\[/, '').replace(/\].*$/, ''),
    url:   string.replace(/^.*\(/, '').replace(/\).*$/, '')
  }
}

function stripHyperMarkdownBadge(text) {
  return text.replace('[![](https://github.com/mixmix/hypermarkdown/raw/master/hypermarkdown_badge.png)](https://hypermarkdown.herokuapp.com)', '')
}

