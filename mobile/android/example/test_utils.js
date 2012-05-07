var _ = require('underscore');

function assert(exp, msg) {
    if (!exp) {
        throw "FAILURE: "+msg;
    }
}

function createDocWithProperties(db, props) {
    var doc = db.untitledDocument();
    assert(doc, "couldn't create doc");
    assert(!doc.currentRevisionID, "new doc should not have currentRevisionID");
    assert(!doc.currentRevision, "new doc should not have currentRevision");
    assert(!doc.documentID, "new untitled doc should not have documentID");
    
    doc.putProperties(props); // saves the doc!
    
    assert(doc.currentRevisionID, "saved doc should have currentRevisionID");
    assert(doc.currentRevision, "saved doc should have currentRevision");
    assert(doc.documentID, "saved doc should have documentID");
    
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