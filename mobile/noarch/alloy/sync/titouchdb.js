/**
 * Persistence adapter for TiTouchDB
 */

var _ = require('alloy/underscore'),
    titouchdb = require('com.obscure.titouchdb'),
    manager = titouchdb.databaseManager,
    db;


/**
 * Run arbitrary views from this model's design document
 * @param {Object} name
 * @param {Object} options
 */
function query_view(db, name, options) {
  var opts = options || {};
  
  var view = db.getExistingView(name);
  var query = view ? view.createQuery() : null;
  if (!query) {
    var err = String.format('invalid view name: %s', name);
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
  if (_.isBoolean(opts.includeDeleted)) { query.includeDeleted = opts.includeDeleted; }
  if (_.isFinite(opts.groupLevel)) { query.groupLevel = opts.groupLevel; }
  if (_.isFinite(opts.indexUpdateMode)) { query.indexUpdateMode = opts.indexUpdateMode; }
  if (_.isBoolean(opts.mapOnly)) { query.mapOnly = opts.mapOnly; }
  
  if (opts.startKey) { query.startKey = opts.startKey; }
  if (opts.endKey) { query.endKey = opts.endKey; }

  if (opts.startKeyDocID) { query.startKeyDocID = opts.startKeyDocID; }
  if (opts.endKeyDocID) { query.endKeyDocID = opts.endKeyDocID; }

  if (_.isArray(opts.keys)) { query.keys = opts.keys; }
  
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
  
  if (!manager.isValidDatabaseName(config.adapter.dbname)) {
    Ti.API.error('Invalid database name: '+config.adapter.dbname);
  }
  
  db = manager.getDatabase(config.adapter.dbname);
  
  // register views
  _.each(config.adapter.views, function(view) {
    var v = db.getView(view.name);
    v.setMapReduce(view.map, view.reduce, view.version || '1');
    Ti.API.info("defined "+view.name);
  });

  return {};
}


function Sync(method, model, options) {
  var opts = options || {};
  var resp = null, err = null;
  
  switch (method) {
    case 'create':
        var props = model.toJSON();
        _.extend(props, model.config.adapter.static_properties || {});
        var doc = model.id ? db.getDocument(model.id) : db.createDocument();
        doc.putProperties(props);
        err = doc.error;
        if (!err) {
          model.set(doc.properties, { silent: true });
          model.id = doc.documentID;
          resp = model.toJSON();
          !opts.silent && model.trigger('change', { fromAdapter: true });
        }
        
        break;

    case 'read':
      if (model.idAttribute) {
        // fetch a single model
        var obj = opts.id ? db.getDocument(opts.id) : db.createDocument();
        if (obj) {
          model.set(obj.properties);
          model.id = obj.documentID;
          !opts.silent && model.trigger('fetch', { fromAdapter: true });
          resp = model.toJSON(); 
        }
        err = db.error;
      }    
      else {
        var collection = model; // just to clear things up 
        
        // collection
        var view = opts.view || collection.config.adapter.views[0]["name"];
        collection.view = view;

        // add default view options from model
        opts = _.defaults(opts, collection.config.adapter.view_options);
        var query = query_view(db, view, opts);
        if (!query) {
          err = { error: 'missing view' };
          break;
        }
        
        var rows = query.run();
        if (rows.error) {
          err = rows.error;
          break;
        }
        
        var len = 0, values = [];
        while (row = rows.next()) {
          var m = collection.map_row(collection.model, row);
          if (m) {
            values.push(m);
            ++len;
          }
        }
        
        resp = 1 === len ? values[0] : values;
        !opts.silent && collection.trigger('fetch', { fromAdapter: true });
      }
      break;

    case 'update':
      var props = model.toJSON();
      _.extend(props, model.config.adapter.static_properties || {});
      var doc = db.getDocument(model.id);
      doc.putProperties(props);
      err = doc.error;
      if (!err) {
        model.set(doc.properties, { silent: true });
        model.id = doc.documentID;
        resp = model.toJSON();
        !opts.silent && model.trigger('change', { fromAdapter: true });
      }
      
      break;
    
    case 'delete':
      if (model.id) {
        var doc = db.getDocument(model.id);
        doc.deleteDocument();
        model.id = null;
        err = doc.error;
        if (!err) {
          resp = model.toJSON();
          !opts.silent && model.trigger('destroy', { fromAdapter: true });
        }
      }
      break;
  }
  
  if (resp) {
    _.isFunction(opts.success) && opts.success(resp);
  } else {
    _.isFunction(opts.error) && opts.error(resp);
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
  Model.prototype.database = db;

  Model.prototype.attachmentNamed = function(name) {
    var doc = db.getDocument(this.id);
    if (doc) {
      return doc.currentRevision.getAttachment(name);
    }
  };
  
  Model.prototype.addAttachment = function(name, contentType, content) {
    var doc = db.getDocument(this.id);
    if (doc) {
      var rev = doc.createRevision();
      rev.setAttachment(name, contentType, content);
      rev.save();
    }
  };
  
  Model.prototype.removeAttachment = function(name) {
    var doc = db.getDocument(this.id);
    if (doc) {
      var rev = doc.createRevision();
      rev.removeAttachment(name);
      rev.save();
    }
  };
  
  Model.prototype.attachmentNames = function() {
    var doc = db.getDocument(this.id);
    return doc ? doc.currentRevision.attachmentNames : [];
  };
  
  return Model;
};

module.exports.afterCollectionCreate = function(Collection) {
  Collection = Collection || {};

  Collection.prototype.database = db;
};
