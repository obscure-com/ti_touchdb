Spine      = require 'spine/core'
Book       = require 'app/models/book'
handlebars = require 'handlebars'

class Show extends Spine.Controller
  className: 'show'
  
  events:
    'click .edit': 'edit'
  
  constructor: ->
    super
    @active @change
  
  render: ->
    @html handlebars.templates['show.html'](@item)
  
  change: (params) ->
    @item = Book.find(params.id)
    @render()
  
  edit: ->
    @navigate '/books', @item.id, 'edit'
  


class Main extends Spine.Stack
  controllers:
    show: Show
  
module.exports = Show