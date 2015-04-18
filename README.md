# hypermarkdown

This is a dynamic mardkown transclusion server - it parses special inclusion syntax and includes remote markdown, then renderes the resulting markdown.

parts of the project: 

- builder.js, which accepts text, and a callback. It fetches md / hmd file from the web translcuding then hands the result to the callback
- a server which you can point at an hmd file. It uses the builder to transclude and then render the markdown

## notation

To include a MD file within your MD file, use the normal markdown-link syntax, prefixed with an 'i'

e.g.  
```
+[example include](https://github.com/mixmix/example-course/blob/master/README.md)
```

