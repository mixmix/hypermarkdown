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
  'content': "and a transclusion which uses +[implicit reference][targetPartialUrl] break\n\n " +
               "[targetPartialUrl]: http://wwww.mock.com/_target.md"
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
      .get(transcludeTarget.path).times(2).reply(200, transcludeTarget.content)
    
    treeBuild(mockDomain + plain.path, function(err, res) {
      if (err) throw err
      t.deepEqual( res['children'], [], 'no transclusion links > it builds a tree one level deep')
    })

    treeBuild(mockDomain + transclude.path, function(err, res) {
      if (err) throw err
      t.notDeepEqual( res['children'], [],                                        '1 explicit transclusion > it is only 2 levels deep')
      t.deepEqual( res['children'][0]['content'], transcludeTarget.content,       '1 explicit transclusion > it loads branch text')
      t.deepEqual( res['children'][0]['url'], mockDomain + transcludeTarget.path, '1 explicit transclusion > it loads branch url')
    })

    treeBuild(mockDomain + refTransclude.path, function(err, res) {
      if (err) throw err
      t.notDeepEqual( res['children'], [],                                        '1 reference transclusion > it is only 2 levels deep (when there is one implicit transclusion)')
      t.deepEqual( res['children'][0]['content'], transcludeTarget.content,       '1 reference transclusion > it loads branch text')
      t.deepEqual( res['children'][0]['url'], mockDomain + transcludeTarget.path, '1 reference transclusion > it loads branch url')
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
