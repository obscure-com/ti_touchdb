exports.definition = {

  config: {
    adapter: {
      type: 'titouchdb',
      dbname: Alloy.CFG.dbname,
      views: [
        {
          name: 'lists',
          version: '1',
          map: function(doc) {
            if (doc.type == 'list') {
              emit(doc.title, null);
            }
          }
        },
        {
          name: 'tasks_by_list',
          version: '1',
          map: function(doc) {
            if (doc.type == 'task') {
              emit(doc.list_id, null);
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
        if (image) {
          task.addAttachment('image.jpg', image.mimeType, image);
        }
        return task;
      },
      deleteList: function() {
        // delete the list document and all task documents associated with it
        var view = this.database.getExistingView('tasks_by_list');
        var query = view.createQuery();
        query.startKey = this.id;
        query.endKey = this.id + '\uFFFF';
        var rows = query.run();
        while (row = rows.next()) {
          row.getDocument().deleteDocument();
        }
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
      },
      updateAllListsWithOwner: function(owner) {
        var view = this.database.getExistingView('lists');
        var query = view.createQuery();
        var rows = query.run();
        while (row = rows.next()) {
          var doc = row.getDocument();
          doc.putProperties(_.extend(doc.properties, { owner: owner }));
        }
      }
    });
    return Collection;
  }
};

