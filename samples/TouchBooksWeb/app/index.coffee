require 'app/lib/setup'

Spine    = require 'spine/core'
Books    = require 'app/controllers/books'

require 'spine/route'

class App extends Spine.Controller
  constructor: ->
    super
    @books = new Books
    @append @books

    Spine.Route.setup()

module.exports = App