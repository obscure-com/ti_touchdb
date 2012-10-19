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


class Edit extends Spine.Controller
  className: 'edit'
  
  elements:
    'form': 'form'
    'input[name=published]': 'published'
  
  events:
    'submit form': 'save'
    'click .save': 'save'
    'click .cancel': 'cancel'
  
  constructor: ->
    super
    @active @change
  
  render: ->
    @html handlebars.templates['edit.html'](@item)
  
  change: (params) ->
    @item = Book.find(params.id)
    @render()
  
  save: (e) ->
    e.preventDefault()
    @item.fromForm(@form)
    @item.published = @item.dateAsPublished(@published.val())
    @item.save()
    @navigate '/books', @item.id
  
  cancel: ->
    @navigate '/books', @item.id


class Main extends Spine.Stack
  controllers:
    show: Show
    edit: Edit
  
module.exports = Main