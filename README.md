# hypermarkdown

This is a dynamic mardkown transclusion server - it parses special inclusion syntax and includes remote markdown, then renderes the resulting markdown.

parts of the project: 

- `treeBuilder( markdownText, callback )` : reads text and recursively fetches markdown files that have been linked to in the `+[file name](url)` format. It stores the markdown (original and fetched) in a json tree, and passes this to the callback.
- `treePartialRender( tree )` : renders the markdown partials of a built tree into html, and returns that tree.
- `treeToHtml( tree )` : provides a couple of methods for rendering tree of html partials into a a single html string.
- server : serves client static files, and provides and api which client-side code can request built and rendered trees of markdown.

## notation

To include a MD file within your MD file, use the normal markdown-link syntax, prefixed with a '+'

e.g.  
```
+[example include](https://github.com/mixmix/example-course/blob/master/README.md)
```

With normal markdown renderers this makes a link like this: 

+[example include](https://github.com/mixmix/example-course/blob/master/README.md)

[See this same file rendered by hypermarkdown](https://hypermarkdown.herokuapp.com)

