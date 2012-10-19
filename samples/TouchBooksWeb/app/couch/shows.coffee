templates = require('duality/templates')

exports.index = (doc, req) ->
  title: 'TouchBooks Web'
  content: templates.render('index.html', req, {})
