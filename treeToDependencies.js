var archy = require('archy')

module.exports = treeToDependencies

function treeToDependencies( tree ) {
  return archy(treeToArchyTree(tree), '', {'unicode': false})
}

function treeToArchyTree(tree) {
  var newTree = {}

  function recurssiveArchyFormat(tree, newTree) {
    var label = tree.parent == null ? tree.url.replace(/^.*\//,'') : tree.label

    newTree.label =  "<a href ='"+tree.url+"'>"+label+"</a>"
    newTree.label += "<button class='btn clipboard' data-clipboard-text='+["+label+"]("+tree.url+")'>"
    newTree.label += "  <img class='clippy' src='images/clippy.svg' alt='Copy to clipboard' width='13'>"
    newTree.label += "</button>"

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

