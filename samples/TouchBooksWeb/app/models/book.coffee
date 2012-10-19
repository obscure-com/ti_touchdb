Spine = require 'spine/core'
require 'spine-adapter/couch-ajax'

class Book extends Spine.Model
  @configure 'Book', 'title', 'author', 'published'
  
  @extend Spine.Model.CouchAjax
  
  @filter: (query) ->
    return @all() unless query
    query = query.toLowerCase()
    @select (item) ->
      item.title?.toLowerCase().indexOf(query) isnt -1 or
        item.author?.toLowerCase().indexOf(query) isnt -1
  
  publishedDate: ->
    return '' if not @published
    dt = new Date
    dt.setFullYear(if @published.length > 0 then @published[0] else 1970)
    dt.setMonth(if @published.length > 1 then @published[1]-1 else 0)
    dt.setDate(if @published.length > 2 then @published[2] else 1)
    dt.toLocaleDateString()
  
module.exports = Book