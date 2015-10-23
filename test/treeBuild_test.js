var test = require('tape')
var nock = require('nock')
var treeBuild = require('../treeBuild')

var mockDomain = 'http://wwww.mock.com'
var plain = {
  'path': '/plain.md',
  'content': 'Test string, with [normal link](www.google.com), nice '
}
var transclude = {
  'path': '/transclude.md',
  'content': 'a +[hypermarkdown](http://wwww.mock.com/_target.md) transclusion.'
}
var refTransclude = { 
  'path': '/reference_transclude.md', 
  'content': 'and an transclusion which uses [implicit reference][targetPartialUrl] break' +
               '[targetPartialUrl]: http://wwww.mock.com/_target.md'
}
var transcludeTarget = {
 'path': '/_target.md',
 'content': 'My sweet **transcluded** text!'
}

module.exports = function() {
  test('treeBuild', function(t) {

    var scope = nock(mockDomain)
      .get(plain.path).reply(200, plain.content)
      .get(transclude.path).reply(200, transclude.content)
      .get(refTransclude.path).reply(200, refTransclude.content)
      .get(transcludeTarget.path).reply(200, transcludeTarget.content)
    

    treeBuild(mockDomain + plain.path, function(err, res) {
      if (err) throw err
      t.deepEqual( res['children'], [], 'it builds a tree one level deep when there are no transclusion links')
    })

    treeBuild(mockDomain + transclude.path, function(err, res) {
      if (err) throw err
      t.notDeepEqual( res['children'], [], 'it is only 2 levels deep')
      t.deepEqual( res['children'][0]['content'], transcludeTarget.content, 'it loads transcluded branch text')
      t.deepEqual( res['children'][0]['url'], mockDomain + transcludeTarget.path, 'it loads transcluded branch url')
    })

    treeBuild(mockDomain + refTransclude.path, function(err, res) {
      if (err) throw err
      t.notDeepEqual( res['children'], [], 'it is only 2 levels deep')
      t.deepEqual( res['children'][0]['content'], transcludeTarget.content, 'it loads transcluded branch text')
      t.deepEqual( res['children'][0]['url'], mockDomain + transcludeTarget.path, 'it loads transcluded branch url')
    })

    //scope.done()
    t.end()
  })
}


function returnChildrenCallback( err, response ) {
  if (err)  console.log( err )

  console.log(response)
  //console.log(response['content'])
  console.log( response['children']  )
  return response['children']
}
