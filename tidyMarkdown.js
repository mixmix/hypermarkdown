var path = require('path')
var findTransclusions = require('./findTransclusions')

module.exports = function tidyMarkdown( treeNode ) {
  [
    stripHyperMarkdownBadge,
    replaceReferenceStyleTransclusions,
    absolutifyTransclusionLinks,
    absolutifyImageLinks
  ]
  .map( function(fn) { fn(treeNode) } )
}


function stripHyperMarkdownBadge( treeNode ) {
  treeNode.content = treeNode.content.
    replace('[![](https://github.com/mixmix/hypermarkdown/raw/master/hypermarkdown_badge.png)](http://hyper.mixmix.io)', '').
    replace('[![](https://github.com/mixmix/hypermarkdown/raw/master/hypermarkdown_badge.png)](https://hypermarkdown.herokuapp.com)', '')
}

function replaceReferenceStyleTransclusions( treeNode ) {
  string = treeNode.content
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
  treeNode.content = string
}

function absolutifyTransclusionLinks( treeNode ) {
  var links = findTransclusions.md( treeNode.content ).map( function(el) { return el.url } )

  links.forEach(function(link) {
    if ( !link.match(/^(http|www)/) ) {
      var fixedUrl = buildAbsoluteUrl( treeNode, link )

      var matcher = new RegExp( "\\+\\[([^\\]]*)]\\(" + link + "\\)", 'g' )
      treeNode.content = treeNode.content.replace(matcher, "+[$1](" + fixedUrl + ")")
    }
  })
}

function absolutifyImageLinks( treeNode ) {
  var links = findTransclusions.image( treeNode.content ).map( function(el) { return el.url } )

  links.forEach(function(link) {
    if ( !link.match(/^(http|www)/) ) {
      var fixedUrl = buildAbsoluteUrl( treeNode, link )
      if ( fixedUrl.match(/blob\/master/) ) {
        fixedUrl = fixedUrl + "?raw=true"
      }

      var matcher = new RegExp( "\\!\\[([^\\]]*)]\\(" + link + "\\)", 'g' )
      treeNode.content = treeNode.content.replace(matcher, "![$1](" + fixedUrl + ")")
    }
  })
}

function buildAbsoluteUrl( treeNode, url ) {
  var parentUrlDir = treeNode.url.replace(/\/[^\/]*$/,'')

  return path.join(parentUrlDir, url)
             .replace(/(^https?:\/)/,"$1/")
}

