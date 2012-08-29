var _ = require('underscore');

function assert(exp, msg) {
    if (!exp) {
        throw "FAILURE: "+msg;
    }
}

function createDocWithProperties(db, props, id) {
    var doc;
    if (id) {
      doc = db.documentWithID(id);
    }
    else {
      doc = db.untitledDocument();
    }
    
    assert(doc, "couldn't create doc");
    // TODO not sure if this is the case any more
    // assert(!doc.currentRevisionID, "new doc should not have currentRevisionID: "+doc.currentRevisionID);
    // assert(!doc.currentRevision, "new doc should not have currentRevision: "+doc.currentRevision);
    
    doc.putProperties(props); // saves the doc!
    
    assert(doc.currentRevisionID, "saved doc should have currentRevisionID: "+doc.documentID);
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