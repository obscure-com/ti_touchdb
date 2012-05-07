Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.TiTouchDB');

exports.run_tests = function() {
    var db = server.databaseNamed('test04');
    db.create();

    try {
        var props = {
            testName: 'testDeleteDocument'
        };
        var doc = createDocWithProperties(db, props);
        assert(!doc.isDeleted, "initial doc should not be deleted");
        doc.deleteDocument();
        assert(doc.isDeleted, "doc should be deleted");
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }

    db.deleteDatabase();
}