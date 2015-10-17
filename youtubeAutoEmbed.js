var regexps = require('./regexps')

module.exports = function youtubeAutoEmbed(string) {
  var matches = string.match( regexps.youtubeTransclusionAnchors ) 
  if (matches) {
    matches.forEach( function(match) {
      string = string.replace( match, convertAnchorToEmbed(match) )
    })
  }

  return string
}


function convertAnchorToEmbed( string ) {
  var youtubeID = string.match( regexps.youtubeId )[1]

  return '<div class="youtube-embed"><iframe width="853" height="480" src="https://www.youtube.com/embed/' + youtubeID + '?rel=0" frameborder="0" allowfullscreen></iframe></div>'
}

