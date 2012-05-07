Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.TiTouchDB');

exports.run_tests = function() {
    var db = server.databaseNamed('test15');
    db.create();

    try {
        var ddoc = db.designDocumentWithName('mydesign');
        ddoc.defineView('vu', 'function(doc){emit(doc.sequence,null);};', '_count');
        ddoc.saveChanges();
        
        // delete the view without going through the view API
        var props = ddoc.properties;
        assert(props, "missing ddoc properties");
        delete props.views;
        ddoc.putProperties(props);
        
        var names = ddoc.viewNames;
        assert(names.length == 0, "got a deleted view back from viewNames: "+names.join(','));
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }

    db.deleteDatabase();
}