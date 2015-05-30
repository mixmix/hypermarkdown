var archy = require('archy')

module.exports = treeToDependencies

function treeToDependencies( tree ) {
  return archy(treeToArchyTree(tree), '', {'unicode': false})
}

function treeToArchyTree(tree) {
  var newTree = {}

  function recurssiveArchyFormat(tree, newTree) {
    newTree.label = "<a href ='"+ tree.url + "'>" + tree.label + "</a>"
    if (tree.parent == null) { newTree.label = "<a href ='"+ tree.url + "'>This file</a>" }
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

