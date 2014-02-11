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
  var dbfile = [basedir, 'elements.touchdb'].join(Ti.Filesystem.separator);
  var attdir = [basedir, 'elements attachments'].join(Ti.Filesystem.separator);
  if (manager.replaceDatabase('elements', dbfile, attdir)) {
    return manager.getExistingDatabase('elements');
  }
  else {
    throw new Exception('could not install elements database');
  }
};


// old stuff below

function assert(exp, msg) {
    if (!exp) {
        throw "FAILURE: "+msg;
    }
}

function wait(ms) {
  var start = +(new Date());
  while (new Date() - start < ms);
}

function createDocWithProperties(db, props, id) {
    var doc;
    if (id) {
      doc = db.documentWithID(id);
    }
    else {
      doc = db.createDocument();
    }
    assert(doc, "couldn't create doc");
    
    var rev = doc.putProperties(props); // saves the doc!
    assert(rev, 'putProperties did not return a revision');
    assert(!doc.error, 'putProperties resulted in an error');
    assert(doc.currentRevisionID, "saved doc should have currentRevisionID: "+doc.currentRevisionID);
    assert(doc.currentRevision, "saved doc should have currentRevision");
    assert(doc.documentID, "saved doc should have documentID");
    if (id) {
      assert(doc.documentID === id, "saved doc id ("+doc.documentID+") does not match id ("+id+")")
    }
    
    return doc;
}

function createDocuments(db, n) {
    var result = [];
    for (var i=0; i < n; i++) {
        var doc = createDocWithProperties(db, {
            testName: 'someTest',
            sequence: i
        });
        result.push(doc);
    }
    return result;
}