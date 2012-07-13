Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.TiTouchDB');

exports.run_tests = function() {
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
}