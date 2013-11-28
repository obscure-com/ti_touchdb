Ti.include('test_utils.js')

var _ = require('underscore'),
    touchdb = require('com.obscure.titouchdb');

exports.run_tests = function() {
  var mgr = touchdb.databaseManager;
  try {
    assert(!mgr.error, 'unexpected database manager error: '+JSON.stringify(mgr.error));
    
    // directory
    assert(mgr.defaultDirectory && mgr.defaultDirectory !== '', 'missing default directory property');

    var allnames = _.filter(mgr.allDatabaseNames, function(n) {
      return n.indexOf('_') != 0;
    });
    assert(!mgr.error, 'unexpected database manager error: allDatabaseNames');
    assert(allnames, 'allDatabaseNames should not return null');
    if (allnames.length > 0) {
      _.each(allnames, function(name) {
        Ti.API.warn("removing leftover database: "+name);
        var db = mgr.existingDatabaseNamed(name);
        db.deleteDatabase();
      });
    }

    Ti.API.info("all database names = "+mgr.allDatabaseNames);

    var nonexistantdb = mgr.existingDatabaseNamed('test002');
    assert(mgr.error, 'unexpected database manager error: nonexistant test002 '+JSON.stringify(mgr.error));
    assert(!nonexistantdb, 'databaseManager.existingDatabaseNamed() returned a nonexistant database '+nonexistantdb);
  
    var newdb = mgr.databaseNamed('test002');
    assert(!mgr.error, 'unexpected database manager error: databaseNamed test002');
    assert(newdb, 'error creating new database: '+JSON.stringify(newdb));
    assert(newdb.name === 'test002', 'created db with incorrect name');
  
    var newdb2 = mgr.existingDatabaseNamed('test002');
    assert(!mgr.error, 'unexpected database manager error');
    assert(newdb2, 'failed to get newly-created db');
    assert(newdb == newdb2, 'proxies were not equal');

    // filter out system databases
    allnames = _.filter(mgr.allDatabaseNames, function(n) {
      return n.indexOf('_') != 0;
    });
    assert(!mgr.error, 'unexpected database manager error: allDatabaseNames');
    assert(allnames.length === 1, 'wrong number of database names');
    assert(allnames[0] === 'test002', 'wrong name returned by allDatabaseNames');
    
    // TODO delete database?
    var result = newdb.deleteDatabase();
    assert(result === true, 'error deleting database: '+JSON.stringify(result));

    // database with invalid characters
    assert(mgr.isValidDatabaseName("wooja"), "incorrect response to isValidDatabaseName for valid name");
    assert(!mgr.isValidDatabaseName("%gnee"), "incorrect response to isValidDatabaseName for invalid name");
    
    var invaliddb = mgr.databaseNamed('_REpL1Cati0n');
    assert(!invaliddb, 'failed to return error when creating a database with an invalid name');
    assert(mgr.error, 'missing error field');

    if (Ti.Platform.osname === 'iphone' || Ti.Platform.osname === 'ipad') {
      // install database
      var basedir = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'assets', 'CouchbaseLite').path;
      var dbfile = [basedir, 'elements.touchdb'].join(Ti.Filesystem.separator);
      var attdir = [basedir, 'elements attachments'].join(Ti.Filesystem.separator);
      var installresult = mgr.installDatabase('elements', dbfile, attdir);
      assert(installresult, 'install failed: '+mgr.error);
      var eldb = mgr.existingDatabaseNamed('elements');
      assert(eldb, 'could not open elements database after install');
      var doc = eldb.documentWithID('1AD71A0D-3213-4059-9D91-8C4A70DD9183');
      var att = doc.currentRevision.attachmentNamed('image.jpg');
      imageView1.image = att.bodyURL;
      eldb.deleteDatabase();
      
      // install failure
      installresult = mgr.installDatabase('failure', '/foo/bar/baz', '/bing/bang/boom');
      assert(!installresult, 'failed install returned true');
      assert(mgr.error, 'no error object on failed install');
    }
  }
  catch (e) {
      throw e;
  }
    
}