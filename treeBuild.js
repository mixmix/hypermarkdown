var async = require('async')
var request = require('request')
var tidyMarkdown = require('./tidyMarkdown')
var findTransclusions = require('./findTransclusions')
var regexps = require('./regexps')

module.exports = function( url, callback ) {
  var parentTree = Tree({
    label:  null,
    url:    url,
    parent: null,
    depth:  0,
  })

  expandTree( parentTree, callback )
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
    attrs.depth = treeNode.depth + 1

    return Tree( attrs )
  }
}

function expandTree( treeNode, callback ) {
  if (isInfiniteLoop(treeNode)) return callback(null, treeNode)

  var getUrl = prepareUrl(treeNode)

  request.get( getUrl, function(err, response, body) {
    if (err) {
      console.error("there was an error getting: " + treeNode.url)
      return callback(err)
    }

    treeNode.content  = body
    tidyMarkdown( treeNode )
    treeNode.children = findTransclusions.md(treeNode.content).map( treeWithParent(treeNode) )

    async.each(
      treeNode.children,
      expandTree,
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

function prepareUrl( treeNode ) {
  url = makeRaw(treeNode.url)

  printGet( url, treeNode )
  return url
}

function printGet( url, treeNode ) {
  if (process.env.NODE_ENV != 'testing') {
    console.log( Array(treeNode.depth*2).join(' ') + green('[Get] ') + url)
  }
}

function green(string) { return ("\033[32m"+ string +"\033[0m") }

function makeRaw( url ) {
  if (url.match( regexps.githublab )) {
    url = url.replace(/\/blob\//, '/raw/')
  }
  return url
}





