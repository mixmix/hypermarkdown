var test = require('tape')
var nock = require('nock')
var treeBuild = require('../treeBuild')

var mockDomain = 'http://wwww.mock.com'
var q = {
  none: {
    path: '/none.md',
    response: 'Test string, with [normal link](www.google.com), nice '
  },
  transclude: {
    path: '/transclude.md',
    response: 'a +[hypermarkdown](http://wwww.mock.com/_target.md) transclusion.'
  },
  relativeTransclude: {
    path: '/relative_transclude.md',
    response: 'a +[hypermarkdown](./_target.md) transclusion.'
  },
  refTransclude: {
    path: '/reference_transclude.md',
    response: "and a transclusion which uses +[some reference][urlReferenceName] break\n\n " +
               "[urlReferenceName]: http://wwww.mock.com/_target.md"
  },
  transcludeTarget: {
   path: '/_target.md',
   response: 'My sweet **transcluded** text!',
   times: 3,
  }
}

module.exports = function() {
  test('treeBuild', function(t) {

    var networkMocker = nock(mockDomain)

    // build mock responses from the mock called q
    Object.keys(q).forEach( function(queryName) {
      var query = q[queryName]
      var times = query.times || 1

      networkMocker.get(query.path)
                   .times(times)
                   .reply(200, query.response)
    })

    treeBuild(mockDomain + q.none.path, function(err, res) {
      if (err) throw err
      t.deepEqual( res.children, [], '0 transclusion > it builds a tree one level deep')
    })

    treeBuild(mockDomain + q.transclude.path, function(err, res) {
      if (err) throw err
      t.notDeepEqual( res.children,               [],                                   '1 transclusion (explicit) > it is only 2 levels deep')
      t.deepEqual(    res.children[0]['content'], q.transcludeTarget.response,          '1 transclusion (explicit) > it loads branch text')
      t.deepEqual(    res.children[0]['url'],     mockDomain + q.transcludeTarget.path, '1 transclusion (explicit) > it loads branch url')
    })

    treeBuild(mockDomain + q.relativeTransclude.path, function(err, res) {
      if (err) throw err
      t.notDeepEqual( res.children,               [],                                   '1 transclusion (relative) > it is only 2 levels deep')
      t.deepEqual(    res.children[0]['content'], q.transcludeTarget.response,          '1 transclusion (relative) > it loads branch text')
      t.deepEqual(    res.children[0]['url'],     mockDomain + q.transcludeTarget.path, '1 transclusion (relative) > it loads branch url')
    })

    treeBuild(mockDomain + q.refTransclude.path, function(err, res) {
      if (err) throw err
      t.notDeepEqual( res.children, [],                                             '1 transclusion (reference) > it is only 2 levels deep')
      t.deepEqual(    res.children[0]['content'], q.transcludeTarget.response,      '1 transclusion (reference) > it loads branch text')
      t.deepEqual(    res.children[0]['url'], mockDomain + q.transcludeTarget.path, '1 transclusion (reference) > it loads branch url')
    })

    //scope.done()
    t.end()
  })
}


function returnChildrenCallback( err, response ) {
  if (err)  console.log( err )

  console.log(response)
  //console.log(response['response'])
  console.log( response.children  )
  return response.children
}
