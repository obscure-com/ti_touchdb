Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.titouchdb');

exports.run_tests = function() {
    var db = server.databaseNamed('test03a');
    db.create();

    try {
        var docs = [];
        for (var i=0; i < 5; i++) {
            var props = {
                testName: 'saveMultipleDocuments',
                sequence: i
            };
            var doc = createDocWithProperties(db, props);
            docs.push(doc);
        }
        
        var revisions = [], revisionProperties = [];
        _.each(docs, function(doc) {
            var rev = doc.currentRevision;
            assert(rev.revisionID.indexOf('1-') == 0, "first revision should start with 1-");
            var p = rev.properties;
            p.misc = 'updated!';
            revisions.push(rev);
            revisionProperties.push(p);
        });
        
        db.putChanges(revisionProperties, revisions);
        
        _.each(docs, function(doc) {
           var rev = doc.currentRevision; 
           assert(rev.revisionID.indexOf('2-') == 0, "second revision should start with 2-");
           var p = rev.properties;
           assert(p.misc === 'updated!', "missing updated field");
           assert(p.testName === 'saveMultipleDocuments', "missing original field");
        });
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }

    db.deleteDatabase();
}