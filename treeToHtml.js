
module.exports = {
  plain: treeToPlainHtml,
  stitched: treeToStitchedHtml,
}

function treeToPlainHtml ( tree ) {
  var html = html || ''
  if (tree.parent == null) html = tree.content

  function recurssiveStitch(tree) {
    tree.children.forEach( function(childTree) {
      html = plainSubstitute( childTree.url, childTree.content, html )
      recurssiveStitch( childTree ) 
    })
  }

  recurssiveStitch(tree)
  return html
}

// TODO ask Mikey why this didn't work
//function treeToStitchedHtml ( tree ) {
  //var html = html || ''
  //if (tree.parent == null) html = tree.content

  //tree.children.forEach( function(childTree) {
    //html = stitchSubstitute( childTree.url, childTree.content, html )
    //treeToStitchedHtml( childTree ) 
  //})
  //return html
//}

function treeToStitchedHtml ( tree ) {
  var html = html || ''
  if (tree.parent == null) html = tree.content

  function recurssiveStitch(tree) {
    tree.children.forEach( function(childTree) {
      html = stitchSubstitute( childTree, html )
      recurssiveStitch( childTree ) 
    })
  }

  recurssiveStitch(tree)
  return html
}

function plainSubstitute (url, importedText, wholeText) {
  var regex = new RegExp('\\+\<a href\=(\'|\")' + url + '.*\<\/a\>', 'g')
  return wholeText.replace(regex, importedText)
}

function stitchSubstitute (treeNode, wholeText) {
  var regex = new RegExp('\\+\<a href\=(\'|\")' + treeNode.url + '.*\<\/a\>', 'g')
  var importedText = "<div class='stitch-mark visible' data-url='" + treeNode.url + "'>" + 
                        "<button class='collapser has-plus'></button>" +
                        "<div class='content expanded'>" + treeNode.content + "</div>" +
                        "<div class='content collapsed hidden'>" + treeNode.label + "</div>" +
                     "</div>"
  return wholeText.replace(regex, importedText)
}
