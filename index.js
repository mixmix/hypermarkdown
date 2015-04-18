var build = require('./builder')

var text = "# Test doc\
\
This is a test to see if we can transclude from links \
\
---\
\
# Loomio Readme\
\
i[loomio readme](http://github.com/loomio/loomio/raw/master/README.md)\
\
---\
# Lineman Setup\
i[liname setup](https://github.com/loomio/loomio/raw/master/lineman/README.md)\
"

//console.log(build(text))
//var transcluded = build(text, function(err, text) { return text })
var transcluded = build(text, function(err, text) { console.log(text) })

//console.log(transcluded)

