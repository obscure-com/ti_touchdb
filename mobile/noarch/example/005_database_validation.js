Ti.include('test_utils.js')

var _ = require('underscore'),
    touchdb = require('com.obscure.titouchdb');

function required(rev, field) {
  if (!rev.properties[field]) {
    Ti.API.warn('invalid doc; field "'+field+'" is required');
    return false;
  }
  return true;
}

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
    assert(!db.error, 'doc1 returned error: '+JSON.stringify(rev1));
    
    var doc2 = db.documentWithID('fail_validation');
    var rev2 = doc2.putProperties({
      no_tag: true
    });
    assert(rev2 == null, 'putProperties of first revision should have returned null for invalid doc')
    assert(doc2.error, 'doc2.putProperties did not return error as expected: '+JSON.stringify(db.error));
    assert(doc2.error.code === 403, 'validation failure should be a 403 error');
    
    // update invalid doc with new, valid revision
    var rev3 = doc2.putProperties({
      tag: 2,
      anotherProperty: null
    });
    assert(rev3 != null, 'putProperties should have returned a revision for newly-valid doc');
    assert(!doc2.error, 'rev3 putProperties caused an error: '+JSON.stringify(rev3));
    
    // test removing validation
    var doc3 = db.untitledDocument();
    var rev4 = doc3.putProperties({
      x: 12.4
    });
    assert(rev4 == null, 'putProperties fo first revision should hvae returned null for invalid doc');
    assert(doc3.error, 'rev4 should result in an error object');
    
    db.defineValidation('require_tag');
    
    var rev5 = doc3.putProperties({
      x: 12.4
    });
    assert(rev5, 'rev5 should work now that validation has been removed');
    assert(rev5.revisionID !== null, 'rev5 should have a revision ID');
    assert(!doc3.error, 'doc3 should not have an error object after validation was removed');
    
    // validation with external calls?  craziness!
    db.defineValidation('external_fn_test', function(rev, context) {
      return required(rev, 'foo') && required(rev, 'bar');
    });
    
    var doc4 = db.untitledDocument();
    var rev6 = doc4.putProperties({
      foo: 3.14
    });
    assert(!rev6, 'rev6 should not exist');
    assert(doc4.error, 'doc4 should have an error object: '+JSON.stringify(doc4.error));
    assert(doc4.error.code == 403, 'doc4 should have 403 error for validation failure');
    
    var rev7 = doc4.putProperties({
      foo: 3.14,
      bar: 'emma the weasel',
      baz: true,
      x: [1,2,3]
    });
    assert(rev7, 'rev7 should be a valid revision');
    assert(rev7.revisionID !== null, 'rev7 should have a revision ID');
    assert(rev7.revisionID !== rev5.revisionID, 'rev7 should be a new revision');
    assert(!doc4.error, 'doc4 should not have an error object');
    
    db.deleteDatabase();
  }
  catch (e) {
    db.deleteDatabase();
    throw e;
  }
    
}