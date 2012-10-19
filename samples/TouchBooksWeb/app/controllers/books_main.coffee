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
    
    Book.bind 'change', (newRecord) =>
      @render()
  
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

class Create extends Spine.Controller
  className: 'create'

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
    @html handlebars.templates['create.html'](@item)

  change: (params) ->
    @render()

  save: (e) ->
    e.preventDefault()
    @item = Book.fromForm(@form)
    @item._id = @item.id if @item.id
    @item.published = @item.dateAsPublished(@published.val())
    @item.save()
    @navigate '/books', @item.id

  cancel: ->
    @navigate '/books'

class Main extends Spine.Stack
  controllers:
    show: Show
    edit: Edit
    create: Create
  
module.exports = Main