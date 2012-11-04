exports.definition = {

  config: {
    adapter: {
      type: "titouchdb",
      dbname: "books",
      collection_name: "books",
      views: [
        { name: "by_author", map: "function(doc) { if (doc.author) { emit(doc.author, null); } }" },
        { name: "by_published", map: "function(doc) { if (doc.published && doc.published.length > 0) { emit(doc.published[0], null); } }" }
      ],
      view_options: {
        prefetch: true
      },
      modelname: 'book'
    }
  },

  extendModel: function(Model) {
    _.extend(Model.prototype, {
    });
    return Model;
  },

  extendCollection: function(Collection) {
    _.extend(Collection.prototype, {
      map_row: function(Model, row) {
      	var result = new Model(row.document.properties); 
      	var attnames = row.document.currentRevision.attachmentNames;
		if (attnames && attnames.length > 0) {
			var att = row.document.currentRevision.attachmentNamed(attnames[0]);
			result.set('cover', att.body);
		}
        return result;
      }
    });
    return Collection;
  }
};

