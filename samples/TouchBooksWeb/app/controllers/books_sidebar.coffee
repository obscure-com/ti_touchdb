Spine      = require 'spine/core'
Book       = require 'app/models/book'
List       = require 'spine/list'
handlebars = require 'handlebars'

class Sidebar extends Spine.Controller
  className: 'sidebar'
  
  elements:
    '.items': 'items'
    'input[type=search]': 'search'
  
  events:
    'keyup input[type=search]': 'filter'
    'click footer button': 'create'
  
  constructor: ->
    super
    
    @html handlebars.templates['sidebar.html']()
    
    @list = new List
      el: @items
      template: (items) ->
        (handlebars.templates['item.html'])(item) for item in items

      selectFirst: true
    
    @list.bind 'change', @change
    
    Book.bind 'refresh change', @render
  
  filter: ->
    @query = @search.val()
    @render
  
  render: =>
    books = Book.filter(@query)
    @list.render(books)
  
  change: (item) =>
    @navigate '/books', item.id
  
  create: ->
    @navigate '/books', 'create'

module.exports = Sidebar
  