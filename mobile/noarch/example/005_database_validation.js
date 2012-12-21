Ti.include('test_utils.js')

var _ = require('underscore'),
    touchdb = require('com.obscure.titouchdb');

exports.run_tests = function() {
  var db = touchdb.databaseManager.createDatabaseNamed('test005');
  try {
    db.defineValidation('require_tag', function(rev, context) {
      return rev.properties.tag != null;
    });
    
    // first, try inserting a doc that should pass validation
    var doc1 = db.documentWithID('pass_validation');
    var rev1 = doc1.putProperties({
      tag: 1,
      someOtherField: 'foo'
    });
    assert(rev1 != null, 'putProperties should have returned a revision for a valid doc');
    assert(!rev1.error, 'doc1 returned error: '+JSON.stringify(rev1));
    
    var doc2 = db.documentWithID('fail_validation');
    var rev2 = doc2.putProperties({
      no_tag: true
    });
    assert(rev2 != null, 'putProperties should have returned something for invalid doc')
    assert(rev2.error, 'doc2.putProperties returned error as expected: '+JSON.stringify(rev2));
    assert(rev2.code === 403, 'validation failure is a 403 error');
    
    // update invalid doc with new, valid revision
    var rev3 = doc2.putProperties({
      tag: 2,
      anotherProperty: null
    });
    assert(rev3 != null, 'putProperties should have returned a revision for newly-valid doc');
    assert(!rev3.error, 'rev3 is an error: '+JSON.stringify(rev3));
    
    db.deleteDatabase();
  }
  catch (e) {
    db.deleteDatabase();
    throw e;
  }
    
}