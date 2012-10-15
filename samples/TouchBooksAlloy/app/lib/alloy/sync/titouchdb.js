/**
 * Persistence adapter for TiTouchDB
 */

var _ = require('alloy/underscore'),
    server = require('com.obscure.titouchdb'),
    db,
    modelname;


/**
 * Run arbitrary views from this model's design document
 * @param {Object} name
 * @param {Object} options
 */
function query_view(db, design_doc, name, options) {
  var opts = options || {};
  
  var ddoc = db.designDocumentWithName(design_doc);
  var query = ddoc.queryViewNamed(name);
  if (!query) {
    var err = String.format('invalid view name: %s/%s', design_doc, name);
    Ti.API.warn(err);
    if (opts.error) {
      opts.error(null, err);
    }
    return null;
  }
  
  if (_.isBoolean(opts.prefetch)) { query.prefetch = opts.prefetch; }
  if (_.isFinite(opts.limit)) { query.limit = opts.limit; }
  if (_.isFinite(opts.skip)) { query.skip = opts.skip; }
  if (_.isBoolean(opts.descending)) { query.descending = opts.descending; }
  if (_.isFinite(opts.groupLevel)) { query.groupLevel = opts.groupLevel; }
  
  return query;
}


function InitAdapter(config) {
  if (!config || !config.adapter) {
    Ti.API.error('missing adapter configuration');
    return;
  }
  
  if (!_.isString(config.adapter.dbname) || config.adapter.dbname.length < 1) {
    Ti.API.error('Missing required adapter configuration property: dbname');
  }
  
  if (!_.isString(config.adapter.collection_name) || config.adapter.collection_name.length < 1) {
    Ti.API.error('Missing required adapter configuration property: collection_name');
  }
  
  db = server.databaseNamed(config.adapter.dbname);
  db.ensureCreated();
  return {};
}


function Sync(model, method, options) {
  var opts = options || {};
  
  switch (method) {
    case 'create':
        var props = model.toJSON();
        props.modelname = model.config.adapter.modelname;
        var doc = db.untitledDocument();
        doc.putProperties(props);
        model.trigger('create');
        break;

    case 'read':
      if (opts.parse) {
        var collection = model; // just to clear things up 
        
        // collection
        var ddoc = collection.config.adapter.collection_name;
        var view = opts.view || collection.config.adapter.views[0];
        
        // add default view options from model
        opts = _.defaults(opts, collection.config.adapter.view_options);
        var query = query_view(db, ddoc, view, opts);
        if (!query) {
          break;
        }
        
        var rows = query.rows();

        // do not use Collection methods!
        var len = 0;
        if (!opts.add) {
          collection.models = [];
        }
        while (row = rows.nextRow()) {
          var m = collection.map_row(collection.model, row);
          if (m) {
            collection.models.push(m);
            ++len;
          }
        }
        collection.view = view;
        collection.length = len;
        collection.trigger('fetch');
      }
      else {
        // object
        var obj = db.documentWithID(model.id)
        model.set(obj.properties);
        model.id = obj.documentID;
        model.trigger('fetch');
      }
      break;

    case 'update':
      var doc = db.documentWithID(model.id);
      doc.putProperties(model.toJSON());
      model.trigger('update');
      break;
    
    case 'delete':
      if (model.id) {
        var doc = db.documentWithID(model.id);
        doc.deleteDocument();
        model.id = null;
        model.trigger('destroy');
      }
      break;
  }  
}

module.exports.sync = Sync;

module.exports.beforeModelCreate = function(config) {
  config = config || {};
  
  InitAdapter(config);

  return config;
};

module.exports.afterModelCreate = function(Model) {
  Model = Model || {};
  
  Model.prototype.idAttribute = '_id'; // true for all TouchDB documents
  Model.prototype.config.Model = Model; // needed for fetch operations to initialize the collection from persistent store
  
  return Model;
};

