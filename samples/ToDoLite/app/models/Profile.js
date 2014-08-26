exports.definition = {

  config: {
    adapter: {
      type: "titouchdb",
      dbname: Alloy.CFG.dbname,
      views: [
        {
          name: 'profiles',
          version: '1',
          map: function(doc) {
            if (doc.type == 'profile') {
              emit(doc.name, null);
            }
          }
        }
      ],
      view_options: {
        prefetch: true
      },
      static_properties: {
        type: 'profile'
      }
    }
  },

  extendModel: function(Model) {
    _.extend(Model.prototype, {
      // TODO maybe set all tasks and lists to this profile?
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

