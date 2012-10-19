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
        return new Model(row.document.properties);
      }
    });
    return Collection;
  }
};

