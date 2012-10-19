Spine = require 'spine/core'
require 'spine-adapter/couch-ajax'
require 'spine-adapter/couch-changes'

class Book extends Spine.Model
  @configure 'Book', '_id', 'title', 'author', 'published'
  
  @extend Spine.Model.CouchAjax
  @extend Spine.Model.CouchChanges()
  
  @filter: (query) ->
    return @all() unless query
    query = query.toLowerCase()
    @select (item) ->
      item.title?.toLowerCase().indexOf(query) isnt -1 or
        item.author?.toLowerCase().indexOf(query) isnt -1
  
  publishedAsDate: ->
    return '' if not @published
    dt = new Date
    dt.setFullYear(if @published.length > 0 then @published[0] else 1970)
    dt.setMonth(if @published.length > 1 then @published[1]-1 else 0)
    dt.setDate(if @published.length > 2 then @published[2] else 1)
    dt.toLocaleDateString()
  
  dateAsPublished: (value) ->
    dt = new Date(value)
    [dt.getFullYear(), dt.getMonth() + 1, dt.getDate()]
  
module.exports = Book