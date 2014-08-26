/*
 * To test down-migrations, run the app once to get both migration datasets
 * inserted, then uncomment the "migration" property below and run again. The
 * adapter should remove the data added in the 201406110800 migration file.
 */

exports.definition = {

  config: {
    adapter: {
      type: "titouchdb",
      dbname: "contacts",
      // migration: "201405140800",
      views: [
        {
          name: "by_lastname",
          version: '1',
          map: function(doc) {
            if (doc.modelname == 'contact' && doc.last) {
              emit(doc.last, null);
            }
          }
        }
      ],
      view_options: {
        prefetch: true
      },
      modelname: 'contact'
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
        var result = new Model(row.documentProperties);
        // add custom properties here, if any
        return result;
      }
    });
    return Collection;
  }
};
