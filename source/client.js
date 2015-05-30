var url   = require('url')
var xhr   = require('xhr')
var dom   = require('domquery')
var archy = require('archy')

var treeToHtml = require('../treeToHtml')

var requestDetails = url.parse(window.location.href, true)
var source = requestDetails.query.source
var mode = requestDetails.query.style

var mdRegex = new RegExp(/\.h?md(\#[-_\w]*)?/)

if (source) {
  xhr({
    uri: '/api/render?source=' + source,
    headers: {
      "Content-Type": "application/json"
    }
  }, renderResponse)
}
else {
  dom('#loading').addClass('hidden')
  dom('#how-to').removeClass('hidden')
}

function renderResponse (err, resp, body) {
  if (resp.statusCode == 400) {
    var insertContent = body
  }
  else {
    console.log(body)
    var results = JSON.parse(body)

    if (mode == 'plain') {
      var insertContent = treeToHtml.plain(results)
    }
    else {
      var insertContent = treeToHtml.stitched(results)
    }
  }

  dom('.container.target').replace('#loading', "<div class='markdown-body'>{insert}</div>", {insert: insertContent} )

  var dependencyTree = archy(treeToDependencies(results), '  ', {'unicode': false})
  dom('.container.dependencies').add( "<div class='markdown-body'><pre>{insert}</pre></div>", {insert: dependencyTree} )
  dom('.container.dependencies').toggleClass('hidden')
}

dom('.container.controls button.toggle-stitches').on('click', toggleStitches)
dom('body').on('click', '.stitch-mark .collapser', toggleCollapse)

function toggleStitches(evt) {
  dom('.container.controls button.toggle-stitches').toggleClass('active')
  dom('.stitch-mark').toggleClass('visible')

  dom('.stitch-mark .collapser').toggleClass('hidden')
} 

function toggleCollapse(evt) {
  var sectionHandle = evt.target.parentNode.attributes['data-url'].value

  dom('.stitch-mark[data-url="'+sectionHandle+'"] .content').toggleClass('hidden')
}


function treeToDependencies( tree ) {
  var newTree = {}
  //var newTree = newTree || {}

  function recurssiveArchyFormat(tree, newTree) {
    newTree.label = tree.label
    if (tree.parent == null) { newTree.label = 'this file' }
    newTree.nodes = []

    tree.children.forEach( function(childTree, index) {
      newTree.nodes[index] = {}
      newTree.nodes[index] = recurssiveArchyFormat(childTree, newTree.nodes[index])
    })

    return newTree
  }

  recurssiveArchyFormat(tree, newTree)
  return newTree
}

