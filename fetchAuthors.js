var request = require('request')
var url = require('url')

var userAgent = process.env.USER_AGENT || 'hypermarkdown'

module.exports = fetchAuthorData

function fetchAuthorData (ownerAndRepo, query, callback) {
  fetchCommits(ownerAndRepo, query, afterFetchCommits)
    
  function afterFetchCommits (err, result) {
    if (err) { return callback(err) }

    var users = mapAuthorData(result)
    callback(null, users)
  }
}

function fetchCommits (ownerAndRepo, query, callback) {
  request( buildGithubRequest('repos/'+ownerAndRepo+'/commits', query), function(err, response, body) {
    if (err) { callback(err) } 
   
    fetchMoreCommits(response, query, callback)

    var responseArray = JSON.parse(body)

    callback(null, responseArray)
  })
}

function buildGithubRequest (apiPath, params) {
  var request = {
    url: url.format({
      protocol: 'https',
      host: 'api.github.com',
      pathname: apiPath,
      query: params,
    }),
    headers: { 
      'User-Agent': userAgent, 
    },
  }

  return request
}

function fetchMoreCommits(response, query, callback) {
  if (response.headers.link == null) return

  var paginationRegex = /&page\=(\d+)\>; rel\=.next/
  var nextPageMatch = response.headers.link.match(paginationRegex)

  if (nextPageMatch != null) {
    var newQuery = query 
    newQuery['page'] = nextPageMatch[1]

    fetchCommits(newQuery, callback)
  } 
}

function mapAuthorData (array) {
  var users = {}
  array.forEach( function(el) {
    var author = 
    //if (users[author]) { next }

    users[el.author.login] = {
      'author': el.author.login,
      'avatar_url': el.author.avatar_url,
      'html_url': el.author.html_url,
    }
  })
  return users;
}


