exports.definition = {

  config: {
    adapter: {
      type: "titouchdb",
      dbname: "todos4",
      views: [
        {
          name: "lists",
          version: '1',
          map: function(doc) {
            if (doc.type == 'list') {
              emit(doc.title, null);
            }
          }
        }
      ],
      view_options: {
        prefetch: true
      },
      static_properties: {
        type: 'list'
      }
    }
  },

  extendModel: function(Model) {
    _.extend(Model.prototype, {
      addTask: function(title, image, imageContentType) {
        // TODO
      }
    });
    return Model;
  },

  extendCollection: function(Collection) {
    _.extend(Collection.prototype, {
      map_row: function(Model, row) {
        var result = new Model(row.documentProperties);
        // add custom properties here, if any
        return result;
      }
    });
    return Collection;
  }
};

