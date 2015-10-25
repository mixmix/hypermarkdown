module.exports = {
  md: function findMdTransclusions(text) {
    // General +[]() transclusion link
      //var mdLinks = text.match(/\+  \[  [^\[\]]* \]     \(  [^\)]+ \)  /g)
      //var mdLinks = text.match(/\+\[[^\[\]]*\]\([^\)]+\)/g)

    // Specific +[](.md) transclusion link
      //var mdLinks = text.match(/\+  \[  [^\[\]]* \]     \(  [^\)]+\.md\)  /g)
      var mdLinks = text.match(/\+\[[^\[\]]*\]\([^\)]+\.md\)/g)
      if (mdLinks == null) return []

      return mdLinks.map( seperateLabelAndLink )
    },

  image: function findImageTransclusions(text) {
      //var link_pattern_matches = text.match(/\!  \[  [^\[\]]* \]     \(  ^\)]+ \)  /g)
      var imageLinks = text.match(/\!\[[^\[\]]*\]\([^\)]+\)/g)
      if (imageLinks == null) return []

      return imageLinks.map( seperateLabelAndLink )
    },
}


function seperateLabelAndLink(string) {
  return {
    label: string.replace(/^\+\[/, '').replace(/\].*$/, ''),
    url:   string.replace(/^.*\(/, '').replace(/\).*$/, '')
  }
}

