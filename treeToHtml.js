
module.exports = {
  plain: treeToPlainHtml,
  stitched: treeToStitchedHtml,
}

function treeToPlainHtml ( tree ) {
  var html = html || ''
  if (tree.parent == null) html = tree.content

  function recurssiveStitch(tree) {
    tree.children.forEach( function(childTree) {
      html = plainSubstitute( childTree.source, childTree.content, html )
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
    //html = stitchSubstitute( childTree.source, childTree.content, html )
    //treeToStitchedHtml( childTree ) 
  //})
  //return html
//}

function treeToStitchedHtml ( tree ) {
  var html = html || ''
  if (tree.parent == null) html = tree.content

  function recurssiveStitch(tree) {
    tree.children.forEach( function(childTree) {
      html = stitchSubstitute( childTree.source, childTree.content, html )
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

function stitchSubstitute (url, importedText, wholeText) {
  var regex = new RegExp('\\+\<a href\=(\'|\")' + url + '.*\<\/a\>', 'g')
  importedText = "<div class='stitch-mark'>" + importedText + "</div>"
  return wholeText.replace(regex, importedText)
}
