exports.definition = {

  config: {
    adapter: {
      type: "titouchdb",
      dbname: "books",
      collection_name: "books",
      views: ["by_author", "by_published"],
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

