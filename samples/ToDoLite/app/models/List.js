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
      addTask: function(title, image) {
        var list_id = this.id;
        var task = Alloy.createModel('task', {
          title: title,
          created_at: new Date().getTime(),
          list_id: list_id
        });
        task.save();
        return task;
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

