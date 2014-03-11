var _ = require('underscore');

exports.delete_nonsystem_databases = function(manager) {
  manager.allDatabaseNames.forEach(function(name) {
    if (name.indexOf('_') != 0) {
      manager.getExistingDatabase(name).deleteDatabase();
    }
  });
};

exports.install_elements_database = function(manager) {
  /*
  // this creates a symlink in the module example app which causes problems
  // with deleting and recreating the database.
  var basedir = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'assets', 'CouchbaseLite').path;
  var dbfile = [basedir, 'elements.cblite'].join(Ti.Filesystem.separator);
  var attdir = [basedir, 'elements attachments'].join(Ti.Filesystem.separator);
  if (manager.replaceDatabase('elements', dbfile, attdir)) {
    return manager.getExistingDatabase('elements');
  }
  else {
    throw new Exception('could not install elements database');
  }
  */
  
  var f = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'assets', 'elements.json');
  var docs = JSON.parse(f.read().text);
  var db = manager.getExistingDatabase('elements');
  if (db != null) {
    db.deleteDatabase();
  }
  db = manager.getDatabase('elements');
  for (i in docs.docs) {
    var d = docs.docs[i];
    var doc = db.getDocument(d._id);
    delete d._id;
    doc.putProperties(d);
  }
  return db;
};

exports.create_test_documents = function(db, n) {
  var result = [];
  for (var i=0; i < n; i++) {
      var doc = createDocWithProperties(db, {
          testName: 'someTest',
          sequence: i
      });
      result.push(doc);
  }
  return result;
};


function createDocWithProperties(db, props, id) {
    var doc;
    if (id) {
      doc = db.documentWithID(id);
    }
    else {
      doc = db.createDocument();
    }
    return doc.putProperties(props);
}
