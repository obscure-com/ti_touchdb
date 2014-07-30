/**
 * Persistence adapter for TiTouchDB
 */

var _ = require('alloy/underscore'),
    moment = require('alloy/moment'),
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
        props = _.defaults(props,
          model.config.adapter.static_properties || {},
          model.config.adapter.modelname ? { modelname: model.config.adapter.modelname } : {}
        );
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
      props = _.defaults(props,
        model.config.adapter.static_properties || {},
        model.config.adapter.modelname ? { modelname: model.config.adapter.modelname } : {}
      );
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

// MIGRATIONS

var migration_doc_name = 'titouchdb_migrations';

function Migrator(config) {
  this.dbname = config.adapter.db_name;
  this.idAttribute = config.adapter.idAttribute;
  this.database = db; // TODO ensure db is set?
  
  // ensure that the properties defined in the model config are set
  this.createModel = function(props) {
    var doc = props.id ? this.database.getDocument(props.id) : this.database.createDocument();
    props = _.defaults(props,
      config.adapter.static_properties || {},
      config.adapter.modelname ? { modelname: config.adapter.modelname } : {}
    );
    doc.putProperties(props);
  };
}

// Gets the current saved migration
function GetLatestMigration(database) {
  var mdoc = database.getExistingDocument(migration_doc_name);
  return mdoc ? mdoc.userProperties.id : null;
}

function Migrate(Model) {
  // get list of migrations for this model
  var migrations = Model.migrations || [];

  // get a reference to the last migration
  var lastMigration = {};
  if (migrations.length) { migrations[migrations.length-1](lastMigration); }
  
  // Get config reference
  var config = Model.prototype.config;

  // Set up the migration obejct
  var migrator = new Migrator(config);

  // Get the migration number from the config, or use the number of
  // the last migration if it's not present. If we still don't have a
  // migration number after that, that means there are none. There's
  // no migrations to perform.
  var targetNumber = typeof config.adapter.migration === 'undefined' ||
    config.adapter.migration === null ? lastMigration.id : config.adapter.migration;
  if (typeof targetNumber === 'undefined' || targetNumber === null) {
    return;
  }
  targetNumber = targetNumber + ''; // ensure that it's a string

  // Get the current saved migration number.
  var currentNumber = GetLatestMigration(db);
  
  // If the current and requested migrations match, the data structures
  // match and there is no need to run the migrations.
  var direction;
  if (currentNumber === targetNumber) {
    return;
  } else if (currentNumber && currentNumber > targetNumber) {
    direction = 0; // rollback
    migrations.reverse();
  } else {
    direction = 1;  // upgrade
  }
  
  migrator.database = db;

  // iterate through all migrations based on the current and requested state,
  // applying all appropriate migrations, in order, to the database.
  var lastContext;
  if (migrations.length) {
    for (var i = 0; i < migrations.length; i++) {
      // create the migration context
      var migration = migrations[i];
      var context = {};
      migration(context);

      // if upgrading, skip migrations higher than the target
      // if rolling back, skip migrations lower than the target
      if (direction) {
        if (context.id > targetNumber) { break; }
        if (context.id <= currentNumber) { continue; }
      } else {
        if (context.id <= targetNumber) { break; }
        if (context.id > currentNumber) { continue; }
      }

      // execute the appropriate migration function
      var funcName = direction ? 'up' : 'down';
      if (_.isFunction(context[funcName])) {
        context[funcName](migrator);
        lastContext = context;
      }
    }
  }

  // insert a doc to track this migration
  if (lastContext) {
    var mdoc = db.getDocument(migration_doc_name);
    mdoc.putProperties({
      id: lastContext.id,
      name: lastContext.name,
      applied: moment().unix() 
    });
  }
  
  migrator.db = null;
}

// EXPORTED FUNCTIONS

var cache = {
  config: {},
  Model: {}
};

module.exports.beforeModelCreate = function(config, name) {
  if (cache.config[name]) return cache.config[name];
  config = config || {};
  InitAdapter(config);
  cache.config[name] = config;
  return config;
};

module.exports.afterModelCreate = function(Model, name) {
  if (cache.Model[name]) {
    return cache.Model[name];
  }
  
  Model = Model || {};
  Model.prototype.idAttribute = '_id'; // true for all TouchDB documents
  
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
  
  Migrate(Model);

  cache.Model[name] = Model;

  return Model;
};

/*
module.exports.afterCollectionCreate = function(Collection) {
  Collection = Collection || {};

  Collection.prototype.database = db;
  
  return Collection;
};
*/