Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.titouchdb');

exports.run_tests = function() {
    var db = server.databaseNamed('test03b');
    db.create();

    try {
        var docs = [], docProperties = [];
        
        for (var i=0; i < 5; i++) {
            var d = db.untitledDocument();
            docs.push(d);
            
            var p = (function(index){
                return { order: index };
            })(i);
            docProperties.push(p);
        }
        
        db.putChanges(docProperties, docs);
        
        _.each(docs, function(doc, index) {
            assert(doc.currentRevisionID.indexOf('1-') == 0, "expected first revision to start with 1-");
            assert(doc.currentRevision.properties.order === index, "doc is out of order "+JSON.stringify(doc.currentRevision.properties));
        });
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }

    db.deleteDatabase();
}