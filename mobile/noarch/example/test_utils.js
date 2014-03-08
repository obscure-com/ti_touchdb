var _ = require('underscore');

exports.delete_nonsystem_databases = function(manager) {
  manager.allDatabaseNames.forEach(function(name) {
    if (name.indexOf('_') != 0) {
      manager.getExistingDatabase(name).deleteDatabase();
    }
  });
};

exports.install_elements_database = function(manager) {
  var basedir = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'assets', 'CouchbaseLite').path;
  var dbfile = [basedir, 'elements.cblite'].join(Ti.Filesystem.separator);
  var attdir = [basedir, 'elements attachments'].join(Ti.Filesystem.separator);
  if (manager.replaceDatabase('elements', dbfile, attdir)) {
    return manager.getExistingDatabase('elements');
  }
  else {
    throw new Exception('could not install elements database');
  }
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
