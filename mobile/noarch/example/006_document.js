Ti.include('test_utils.js')

var _ = require('underscore'),
    touchdb = require('com.obscure.titouchdb');

exports.run_tests = function() {
  var mgr = touchdb.databaseManager;
  var db = mgr.databaseNamed('test006');
  try {
    // document creation is tested in other files
    
    // document deletion
    var doc1 = createDocWithProperties(db, {
      a: 10,
      b: false,
      c: 'a string'
    }, 'doc1');
    assert(doc1.deleted == false, 'deleted flag set on doc1 before deletion');
    var status = doc1.deleteDocument();
    assert(status !== false, 'deleteDocument returned false: '+JSON.stringify(doc1.error));
    assert(!doc1.error, 'error after call to deleteDocument()');
    assert(doc1.deleted == true, 'doc1.deleted not set to true after call to deleteDocument() '+JSON.stringify(doc1.properties));
    
    var doc2 = db.documentWithID('doc1');
    assert(doc2, 'could not reselect doc1 by ID');
    assert(doc2.deleted, 'reselected doc was not deleted');
    
    /*
    // purge document
    // won't work until this is applied:
    // https://github.com/couchbase/couchbase-lite-ios/pull/46
    var doc2 = createDocWithProperties(db, {
      pi: 3.14159
    }, 'doc2');
    
    var purgeResult = doc2.purgeDocument();
    assert(!doc2.error, 'error after call to purgeDocument(): '+JSON.stringify(doc2.error));
    assert(purgeResult, 'purgeDocument returned false');
    
    var doc3 = db.cachedDocumentWithID('doc2');
    assert(!doc3, 'db returned a purged document: '+JSON.stringify(doc3));
    */
    
    // TODO doc properties
    var doc4 = createDocWithProperties(db, {
      "item": "apple",
      "prices": {
          "Fresh Mart": 1.59,
          "Price Max": 5.99,
          "Apples Express": 0.79
      }      
    });
    var p4 = doc4.properties;
    assert(p4, 'missing properties for doc4');
    assert(p4['_id'] == doc4.documentID, 'incorrect _id property: '+p4['_id']);
    assert(p4._rev, 'missing _rev property');
    assert(p4.item == 'apple', 'incorrect value for "item" property');
    assert(p4.prices['Fresh Mart'] == 1.59, 'incorrect value for prices["Fresh Mart"] property');

    var u4 = doc4.userProperties;
    assert(u4, 'missing user properties for doc4');
    assert(!u4._id, 'user properties should not contain _id');
    assert(u4.item == 'apple', 'incorrect value for "item" user property');

    assert(doc4.propertyForKey('item') == 'apple', 'incorrect value returned from propertyForKey: ' + doc4.propertyForKey('apple'));

    // TODO notifications
    
    db.deleteDatabase();
  }
  catch (e) {
    db.deleteDatabase();
    throw e;
  }
    
}