var regexps = require('./regexps')

module.exports = function(string) {
  var matches = string.match( regexps.youtubeTransclusionAnchors ) 
  if (matches) {
    matches.forEach( function(match) {
      string = string.replace( match, convertAnchorToEmbed(match) )
      //console.log(string)
    })
  }

  return string
}


function convertAnchorToEmbed( string ) {
  var youtubeID = string.match( regexps.youtubeId )[1]

  return '<iframe width="853" height="480" src="https://www.youtube.com/embed/' + youtubeID + '?rel=0" frameborder="0" allowfullscreen></iframe>'
}

