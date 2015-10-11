var test = require('tape')
var youtubeAutoEmbed = require('../youtubeAutoEmbed.js')

module.exports = function() {
  test('youtubeAutoEmbed', function(t) {
    t.equal(
      youtubeAutoEmbed('plain string'),
      'plain string',
      'returns plain strings unmodified'
    )
    t.equal(
      youtubeAutoEmbed('link +<a href="this.md">test</a>'),
      'link +<a href="this.md">test</a>',
      'returns non-youtube links unmodified'
    )
    t.equal(
      youtubeAutoEmbed('link +<a href="https://www.youtube.com/watch?v=ZnuwB35GYMY">test</a>'),
      'link <iframe width="853" height="480" src="https://www.youtube.com/embed/ZnuwB35GYMY?rel=0" frameborder="0" allowfullscreen></iframe>',
      'replaces youtube links with embedded videos'
    )
   

    t.end()
  })
}

