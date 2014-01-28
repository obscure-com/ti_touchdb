Ti.include('test_utils.js')

var _ = require('underscore'),
    touchdb = require('com.obscure.titouchdb');

exports.run_tests = function() {
  var mgr = touchdb.databaseManager;
  var a = mgr.databaseNamed('test003a');
  try {
    
    assert(a.name === 'test003a', 'incorrect database name: '+ a.name);
    assert(a.documentCount === 0, 'incorrect document count: '+a.documentCount);
    
    var doc1 = a.documentWithID('nonexistant');
    assert(doc1 !== null, 'documentWithID() returned null for nonexistant ID; should create');
    assert(doc1.documentID === 'nonexistant', 'documentWithID() did not set the new document ID correctly '+doc1.documentID);
    
    var doc2 = a.documentWithID();
    assert(doc2 !== null, 'documentWithID(null) should return untitled document');
    assert(doc2.documentID !== null, "documentWithID(null) should have a doc ID");

    // docs aren't saved until a call to putProperties
    assert(a.documentCount === 0, "should have zero docs at this point: "+a.documentCount);
    
    var rev1 = doc1.putProperties({
      testName: 'testCreateDocument',
      tag: 1337
    });
    assert(rev1 !== null, 'putProperties should have returned a revision for doc1');
    assert(doc1.currentRevisionID !== null, 'calling putProperties should have created a revision');
    assert(a.documentCount === 1, "should have one doc at this point: "+a.documentCount);
    
    var rev2 = doc2.putProperties({
      testName: 'testCreateDocument',
      tag: 4567
    });
    assert(rev2 !== null, 'putProperties should have returned a revision for doc2');
    assert(doc2.currentRevisionID !== null, 'calling putProperties should have created a revision');
    assert(a.documentCount === 2, "should have two docs at this point: "+a.documentCount);
    
    // reselect doc
    var doc3 = a.documentWithID('nonexistant');
    assert(doc3 !== null, 'documentWithID() returned null for existing ID');
    assert(doc1 === doc3, 'original and reselected doc should be the same object');
    
    // all documents query
    var query = a.createAllDocumentsQuery();
    assert(query !== null, "all docs query should not be null");
    
    var rows = query.run();
    assert(rows !== null, "all docs query rows returned null");
    assert(rows.count === 2, "incorrect number of rows returned by all docs query: "+rows.count);

    // compact
    var compacted = a.compact();
    assert(a, "compact failed");
    
    a.deleteDatabase();
  }
  catch (e) {
    a.deleteDatabase();
    throw e;
  }
    
}