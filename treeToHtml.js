module.exports = function treeToHtml ( tree ) {
  var html = html || ''
  if (tree.parent == null) html = tree.content

  tree.children.forEach( function(childTree) {
    html = substitute( childTree.source, childTree.content, html )
    treeToHtml( childTree ) 
  })

  return html
}

function substitute(url, imported_text, whole_text) {
  //var regex = new RegExp('\\+\\[.*\\]\\(' + url + '\\)', 'g')
  var regex = new RegExp('\\+\<a href\=(\'|\")' + url + '.*\<\/a\>', 'g')
  return whole_text.replace(regex, imported_text)
}

