var _ = require('underscore'),
    Q = require('q'),
    couch = require('CouchDBClient');



exports.run_tests = function(port) {
  var conn = new couch.Connection(String.format('http://localhost:%d', port));
  
  var db = conn.database('test01');
  
  var setupDatabase = function() {
    return db.exists()
      .then(function(metadata) {
        db.delete()
        .then
      })
  }
  
  db.exists().then(
    function(metadata) {
      Ti.API.info('database exists: '+JSON.stringify(metadata));
    },
    function(err) {
      if (err.status == 404) {
        db.create()
        .fail(function(err) {
          Ti.API.err(err);
        });
      }
    }
  );
  */
  
  

/*  
  db.exists(function(err, resp) {
    if (err) {
      Ti.API.info('db does not exist: '+JSON.stringify(err));
    }
    else {
      Ti.API.info('db exists: '+JSON.stringify(resp.body));
    }
  });
*/

  // db.create();

/*  
  client.info({
    success: function(resp) {
      Ti.API.info(JSON.stringify(resp));
    }
    failure: function(err) {
      throw err;
    }
  });
*/  
  
  
  /*
    // version string
    var version = server.getVersion();
    assert(version, "missing version");
    assert(version.length > 0, "empty version");
    Ti.API.info("version: "+version);
    
    // generate UUIDs
    var uuids = server.generateUUIDs(4);
    assert(uuids, "missing UUIDs");
    assert(uuids.length === 4, "wrong number of UUIDs: "+uuids.length);
    Ti.API.info("got UUIDs: "+uuids.join(','));
    
    // initial state: no databases
    var dbs = server.getDatabases();
    assert(dbs, "getDatabases() returned null");
    assert(dbs.length == 0, "wrong number of databases found: "+_.pluck(dbs, 'relativePath').join(','));
    
    // create a database and check that it is returned
    var db = server.databaseNamed('test01');
    assert(db, "did not new up a database");
    db.create();
    Ti.API.info(String.format("database %s: %d documents", db.relativePath, db.getDocumentCount()));

    dbs = server.getDatabases();
    assert(dbs, "getDatabases() returned null again");
    assert(dbs.length === 1, "wrong number of databases: "+dbs.length);
    
    // TODO delete the database and check that it is gone
    db.deleteDatabase();
    var dbs1 = server.getDatabases();
    assert(dbs1, "getDatabases() returned null again");
    assert(dbs1.length == 0, "wrong number of databases found: "+dbs.length);
    */
}