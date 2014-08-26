exports.definition = {

  config: {
    adapter: {
      type: "titouchdb",
      dbname: Alloy.CFG.dbname,
      views: [
        {
          name: "tasksByDate",
          version: '1',
          map: function(doc) {
            if (doc.type == 'task') {
              emit([doc.list_id, doc.created_at], null);
            }
          }
        }
      ],
      view_options: {
        prefetch: true
      },
      static_properties: {
        type: 'task'
      }
    }
  },

  extendModel: function(Model) {
    _.extend(Model.prototype, {
      deleteTask: function() {
        this.database.getExistingDocument(this.id).deleteDocument();
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

