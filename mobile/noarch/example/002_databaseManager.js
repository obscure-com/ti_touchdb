Ti.include('test_utils.js')

var _ = require('underscore'),
    touchdb = require('com.obscure.titouchdb');

exports.run_tests = function() {
  var mgr = touchdb.databaseManager;
  try {
    assert(!mgr.error, 'unexpected database manager error: '+JSON.stringify(mgr.error));

    var allnames = mgr.allDatabaseNames;
    assert(!mgr.error, 'unexpected database manager error: allDatabaseNames');
    assert(allnames, 'allDatabaseNames should not return null');
    assert(allnames.length == 0, 'allDatabaseNames should return empty array: '+allnames.length);

    var nonexistantdb = mgr.databaseNamed('test002');
    assert(!mgr.error, 'unexpected database manager error: nonexistant test002');
    assert(!nonexistantdb, 'databaseManager.databaseNamed() returned a nonexistant database');
  
    var newdb = mgr.createDatabaseNamed('test002');
    assert(!mgr.error, 'unexpected database manager error: createDatabaseNamed test002');
    assert(newdb, 'error creating new database: '+JSON.stringify(newdb));
    assert(newdb.name === 'test002', 'created db with incorrect name');
  
    var newdb2 = mgr.databaseNamed('test002');
    assert(!mgr.error, 'unexpected database manager error');
    assert(newdb2, 'failed to get newly-created db');
    assert(newdb == newdb2, 'proxies were not equal');

    allnames = mgr.allDatabaseNames;
    assert(!mgr.error, 'unexpected database manager error: allDatabaseNames');
    assert(allnames.length === 1, 'wrong number of database names');
    assert(allnames[0] === 'test002', 'wrong name returned by allDatabaseNames');
    
    // TODO delete database?
    var result = newdb.deleteDatabase();
    assert(result === true, 'error deleting database: '+JSON.stringify(result));

    // database with invalid characters
    var invaliddb = mgr.createDatabaseNamed('_REpL1Cati0n');
    assert(mgr.error, 'missing error field');
    assert(!invaliddb, 'failed to return error when creating a database with an invalid name');
  }
  catch (e) {
      throw e;
  }
    
}