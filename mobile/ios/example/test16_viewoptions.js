Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.TiTouchDB');

exports.run_tests = function() {
    var db = server.databaseNamed('test16');
    db.create();

    try {
        createDocuments(db, 5);
        
        var ddoc = db.designDocumentWithName('mydesign');
        ddoc.defineView('vu', 'function(doc){emit(doc._id,doc._local_seq);};');
        ddoc.saveChanges();
        
        var query = ddoc.queryViewNamed('vu');
        
        var result1 = query.rows();
        while (r = result1.nextRow()) {
            assert(!r.value, "shouldn't have a value: "+r.value);
        }

        /* _local_seq not working yet?
        ddoc.includeLocalSequence = true;
        ddoc.saveChanges();
        
        var result2 = query.rows();
        while (r = result2.nextRow()) {
            assert(r.value, "should have a value");
        }
        */
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }

    db.deleteDatabase();
}