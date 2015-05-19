var Markdown = require('markdown-it')
var md = new Markdown()

module.exports = function renderTreeContent( tree ) {
  tree.content = md.render(tree.content)
  tree.children.forEach(function (childTree) {
    renderTreeContent(childTree)
  })
  return tree
}

