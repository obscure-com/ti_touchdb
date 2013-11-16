/**
 * Persistence adapter for TiTouchDB
 */

var _ = require('alloy/underscore'),
    manager = require('com.obscure.titouchdb').databaseManager,
    db,
    modelname;


/**
 * Run arbitrary views from this model's design document
 * @param {Object} name
 * @param {Object} options
 */
function query_view(db, name, options) {
  var opts = options || {};
  
  var view = db.viewNamed(name);
  var query = view ? view.query() : null;
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
  
  db = manager.createDatabaseNamed(config.adapter.dbname);
  
  // register views
  _.each(config.adapter.views, function(view) {
    var v = db.viewNamed(view.name);
    v.setMapAndReduce(view.map, view.reduce, view.version || '1');
    Ti.API.info("defined "+view.name);
  });

  return {};
}


function Sync(method, model, options) {
  var opts = options || {};
  
  switch (method) {
    case 'create':
        var props = model.toJSON();
        props.modelname = model.config.adapter.modelname;
        var doc = db.untitledDocument();
        doc.putProperties(props);
        model.id = doc.documentID;
        model.trigger('create');
        break;

    case 'read':
      if (opts.parse) {
        var collection = model; // just to clear things up 
        
        // collection
        var view = opts.view || collection.config.adapter.views[0]["name"];
        
        // add default view options from model
        opts = _.defaults(opts, collection.config.adapter.view_options);
        var query = query_view(db, view, opts);
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
      var props = model.toJSON();
      props.modelname = model.config.adapter.modelname;
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

  Model.prototype.attachmentNamed = function(name) {
    var doc = db.documentWithID(this.id);
    if (doc) {
      return doc.currentRevision.attachmentNamed(name);
    }
  };
  
  Model.prototype.addAttachment = function(name, contentType, content) {
    var doc = db.documentWithID(this.id);
    if (doc) {
      var rev = doc.newRevision();
      rev.addAttachment(name, contentType, content);
      rev.save();
    }
  };
  
  Model.prototype.removeAttachment = function(name) {
    var doc = db.documentWithID(this.id);
    if (doc) {
      var rev = doc.newRevision();
      rev.removeAttachment(name);
      rev.save();
    }
  };
  
  Model.prototype.attachmentNames = function() {
    var doc = db.documentWithID(this.id);
    return doc ? doc.currentRevision.attachmentNames : [];
  }
  
  return Model;
};

