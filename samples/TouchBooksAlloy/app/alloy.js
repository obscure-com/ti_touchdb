/*
 * App initialization logic; runs prior to UI load
 */

var server = require('com.obscure.titouchdb'),
    db = server.databaseNamed(Alloy.CFG.books_db_name);

db.ensureCreated();

// load up JSON documents in the "schema" directory
var schemadoc = db.documentWithID('schema');
var applied = schemadoc ? schemadoc.properties.applied || [] : [];

var schemadir = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'schema');
if (schemadir.exists()) {
  var dirty = false;
  
  var fns = schemadir.getDirectoryListing();
  _.each(fns, function(fn) {
    var f = Ti.Filesystem.getFile(schemadir.resolve(), fn);
    var contents = f.exists() ? f.read().text : null;
    var hash = contents ? Ti.Utils.md5HexDigest(contents) : null;
    if (hash && applied.indexOf(hash) === -1) {        
      var json = JSON.parse(contents);
      // get the existing revision if the doc already exists
      _.each(json.docs, function(doc) {
        if (doc._id) {
          var existing = db.documentWithID(doc._id);
          if (existing.currentRevisionID) {
            doc._rev = existing.currentRevisionID;
          }
        }
      });
      db.putChanges(json.docs);
      applied.push(hash);
      dirty = true;
    }
  });
  
  if (dirty) {
    schemadoc.putProperties({
      applied: applied
    });
  }
} 
else {
  Ti.API.error('Schema directory ' + schemadir.resolve() + ' does not exist');
}
