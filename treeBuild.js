var async = require('async')
var request = require('request')
var path = require('path')
var regexps = require('./regexps')

module.exports = function( url, callback ) {
  var parentTree = Tree({
    label: null,
    url: url,
    parent: null,
    depth: 0,
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

  var getUrl = makeRaw(treeNode.url)
  if (process.env.NODE_ENV != 'testing') {
    console.log( Array(treeNode.depth*2).join(' ') + green('[Get] ') + getUrl)
  }

  request.get( getUrl, function(err, response, body) {
    if (err) {
      console.error("there was an error getting: " + treeNode.url)
      return callback(err)
    }

    treeNode.content = stripHyperMarkdownBadge(body)
    expandTransclusionLinks(treeNode)
    expandImageLinks(treeNode)

    treeNode.children = findTransclusionLinks(treeNode.content).map( treeWithParent(treeNode) )

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

function green(string) { return ("\033[32m"+ string +"\033[0m") }

function makeRaw( url ) {
  if (url.match( regexps.githublab )) {
    url = url.replace(/\/blob\//, '/raw/')
  }
  return url
}

function expandTransclusionLinks( treeNode ) {
  var links = findTransclusionLinks( treeNode.content ).map( function(el) { return el.url } )

  links.forEach(function(link) {
    if ( !link.match(/^(http|www)/) ) {
      var fixedLink = buildExplicitLink( treeNode, link )

      var matcher = new RegExp( "\\+\\[([^\\]]*)]\\(" + link + "\\)", 'g' )
      treeNode.content = treeNode.content.replace(matcher, "+[$1](" + fixedLink + ")")
    }
  })
}

function expandImageLinks( treeNode ) {
  var links = findImageLinks( treeNode.content ).map( function(el) { return el.url } )

  links.forEach(function(link) {
    if ( !link.match(/^(http|www)/) ) {
      var fixedLink = buildExplicitLink( treeNode, link )
      if ( fixedLink.match(/blob\/master/) ) {
        fixedLink = fixedLink + "?raw=true"
      }

      var matcher = new RegExp( "\\!\\[([^\\]]*)]\\(" + link + "\\)", 'g' )
      treeNode.content = treeNode.content.replace(matcher, "![$1](" + fixedLink + ")")
    }
  })
}

function buildExplicitLink( treeNode, url ) {
  var parentUrlDir = treeNode.url.replace(/\/[^\/]*$/,'')

  return path.join(parentUrlDir, url)
             .replace(/(^https?:\/)/,"$1/")
}

function findTransclusionLinks(text) {
  text = replaceReferenceStyleTransclusions(text)
  //console.log(text)

  //var link_pattern_matches = text.match(/\+  \[  [^\[\]]* \]     \(  [^\)]+ \)  /g)
  var transclusionLinks = text.match(/\+\[[^\[\]]*\]\([^\)]+\)/g)
  if (transclusionLinks == null) return []

  return transclusionLinks.map( seperateLabelAndLink ) 
}

function findImageLinks(text) {
  //var link_pattern_matches = text.match(/\!  \[  [^\[\]]* \]     \(  ^\)]+ \)  /g)
  var imageLinks = text.match(/\!\[[^\[\]]*\]\([^\)]+\)/g)
  if (imageLinks == null) return []

  return imageLinks.map( seperateLabelAndLink ) 
}
function replaceReferenceStyleTransclusions(string) {
  var referenceTransclusions = string.match(/\+\[[^\[\]]*\]\[[^\]]+\]/g)
  if (referenceTransclusions == null ) return string

  referenceTransclusions.forEach( function(match) {
    var referenceHandle = match.replace(/(.*\[|\])+/g, '')
    var referenceUrlMatch = string.match( new RegExp( "\\[" + referenceHandle + "\\]:\\s*([^\\s]+)" ))
    
    if (referenceUrlMatch) {
      var referenceLabel = match.replace(/(\+\[|\].+)/g, '')
      var standardTransclusion = match.replace( /\[[^\[]+\s*$/, "("+ referenceUrlMatch[1] + ")" )

      var regex = new RegExp("\\+\\[" + referenceLabel + "\\]\\[" + referenceHandle + "\\]", 'g')

      string = string.replace(new RegExp("\\+\\[" + referenceLabel + "\\]\\[" + referenceHandle + "\\]", 'g'), standardTransclusion)

    }
  })
  return string
}

function seperateLabelAndLink(string) {
  return {
    label: string.replace(/^\+\[/, '').replace(/\].*$/, ''),
    url:   string.replace(/^.*\(/, '').replace(/\).*$/, '')
  }
}

function stripHyperMarkdownBadge(text) {
  return text.replace('[![](https://github.com/mixmix/hypermarkdown/raw/master/hypermarkdown_badge.png)](http://hyper.mixmix.io)', '').
              replace('[![](https://github.com/mixmix/hypermarkdown/raw/master/hypermarkdown_badge.png)](https://hypermarkdown.herokuapp.com)', '')
}

