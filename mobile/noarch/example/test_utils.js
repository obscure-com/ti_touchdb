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
    assert(!doc.currentRevisionID, "new doc should not have currentRevisionID: "+doc.currentRevisionID);
    assert(!doc.currentRevision, "new doc should not have currentRevision: "+doc.currentRevision);
    
    doc.putProperties(props); // saves the doc!
    
    assert(doc.currentRevisionID, "saved doc should have currentRevisionID");
    assert(doc.currentRevision, "saved doc should have currentRevision");
    assert(doc.documentID, "saved doc should have documentID");
    if (props._id) {
      assert(doc.documentID === props._id, "saved doc id ("+doc.documentID+") does not match props._id ("+props._id+")")
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