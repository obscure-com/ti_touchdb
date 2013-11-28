var _ = require('underscore');

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