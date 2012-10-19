Spine   = require 'spine/core'
Book    = require 'app/models/book'

Main    = require 'app/controllers/books_main'
Sidebar = require 'app/controllers/books_sidebar'

class Books extends Spine.Controller
  className: 'books'
  
  constructor: ->
    super
    
    @sidebar = new Sidebar
    @main = new Main
    
    @routes
      '/books/:id/create': (params) ->
        @sidebar.active(params)
        @main.create.active(params)
      '/books/:id/edit': (params) ->
        @sidebar.active(params)
        @main.show.active(params)
      '/books/:id': (params) ->
        @sidebar.active(params)
        @main.active(params)
    
    @append @sidebar, @main
    
    Book.fetch()


module.exports = Books