Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.titouchdb');

exports.run_tests = function() {
    var db = server.databaseNamed('test05a');
    db.create();

    try {
        var n = 5;
        createDocuments(db, n);
        
        db.clearDocumentCache();
        var query = db.getAllDocuments();
        assert(!query.designDocument, "getAllDocuments should not have a design doc");
        
        var rows = query.rows();
        while (row = rows.nextRow()) {
           var doc = row.document; 
           assert(doc, "did not get doc from query row");
           assert(doc.currentRevision.propertiesAreLoaded, "query row should have preloaded doc properties");
           var props = doc.properties;
           props.comment = 'added comment';
           doc.putProperties(props);
        }
        
        // re-fetch to ensure that revision was bumped and new property is present
        var refetch = db.getAllDocuments().rows();
        while (r = refetch.nextRow()) {
          var d = r.document;
          assert(d, "did not get re-fetched document");
          assert(d.currentRevisionID && d.currentRevisionID.indexOf('2-') == 0, 'new revision should start with 2-; is '+d.currentRevisionID);
          var p = d.properties;
          assert(p, "did not get re-fetched properties");
          assert(p.comment == 'added comment', 'new property was not saved');
          assert(p.testName == 'someTest', 'missing previous revision property "testName"');
        }
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }

    db.deleteDatabase();
}