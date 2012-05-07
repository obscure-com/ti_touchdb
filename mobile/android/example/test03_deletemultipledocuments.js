Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.TiTouchDB');

exports.run_tests = function() {
    var db = server.databaseNamed('test03c');
    db.create();

    try {
        var docs = [];
        for (var i=0; i < 5; i++) {
            var props = {
                testName: 'deleteMultipleDocuments',
                sequence: i
            };
            var doc = createDocWithProperties(db, props);
            docs.push(doc);
        }
        
        db.deleteDocuments(docs);
        
        _.each(docs, function(doc) {
            assert(doc.isDeleted, "document was not deleted");
        });
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }

    db.deleteDatabase();
}