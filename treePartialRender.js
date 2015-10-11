var Markdown = require('markdown-it')
var md = new Markdown()

module.exports = function treePartialRender( tree ) {
  tree.content = md.render(tree.content)
  tree.children.forEach(function (childTree) {
    treePartialRender(childTree)
  })
  return tree
}

