Ti.include('test_utils.js')

var _ = require('underscore'),
    touchdb = require('com.obscure.titouchdb');

exports.run_tests = function() {
  var mgr = touchdb.databaseManager;
  var db = mgr.createDatabaseNamed('test011');
  
  try {
    for (i=0; i < 10; i++) {
      createDocWithProperties(db, {
        testName: 'someTest',
        name: 'test-'+i,
        i: i
      });
    }
    
    // update documents in a query loop
    (function() {
      var query = db.queryAllDocuments();
      var rows = query.rows();
      while (row = rows.nextRow()) {
        var doc = row.document; 
        assert(doc, "did not get doc from query row");
        var props = doc.properties;
        props.comment = 'added comment';
        doc.putProperties(props);
      }
    })();

    // refetch to make sure they are correct
    (function() {
      var query = db.queryAllDocuments();
      var rows = query.rows();
      while (row = rows.nextRow()) {
        var doc = row.document; 
        assert(doc, "did not get doc from query row");
        assert(doc.currentRevisionID && doc.currentRevisionID.indexOf('2-') == 0, 'new revision should start with 2-; is '+doc.currentRevisionID);
        var props = doc.properties;
        assert(props, "did not get re-fetched properties");
        assert(props.comment == 'added comment', 'new property was not saved');
        assert(props.testName == 'someTest', 'missing previous revision property "testName"');
      }
    })();
    
    db.deleteDatabase();
  }
  catch (e) {
    db.deleteDatabase();
    throw e;
  }

}