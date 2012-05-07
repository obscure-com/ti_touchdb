Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.TiTouchDB');

exports.run_tests = function() {
    var db = server.databaseNamed('test06');
    db.create();

    try {
        var n = 5;
        createDocuments(db, n);
        
        db.clearDocumentCache();
        var query = db.getAllDocuments();
        assert(!query.designDocument, "getAllDocuments should not have a design doc");
        
        var rows = query.rows();
        assert(rows.rowCount === n, "incorrect number of rows");
        assert(rows.totalCount === n, "incorrect totalCount in query result");
        
        var rowsIfChanged = query.rowsIfChanged();
        assert(!rowsIfChanged, "should not have any changed rows");
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }

    db.deleteDatabase();
}