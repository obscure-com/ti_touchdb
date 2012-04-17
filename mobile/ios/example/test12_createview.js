Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.TiTouchDB');

exports.run_tests = function() {
    var db = server.databaseNamed('test12');
    db.create();

    try {
        var ddoc = db.designDocumentWithName('mydesign');
        assert(ddoc, "missing design document");
        assert(!ddoc.changed, "design doc should not be changed");
        assert(ddoc.viewNames.length == 0, "new design doc should not have any views");

        var map = 'function(doc) { emit(doc.name, null); }', reduce = '_count';
        
        ddoc.defineView('vu', map, reduce);
        assert(ddoc.viewNames.length == 1, "view names length did not increase");
        assert(ddoc.viewNames[0] === 'vu', "incorrect view name: "+ddoc.viewNames[0]);
        assert(ddoc.mapFunctionOfViewNamed('vu') === map, "incorrect map function");
        assert(ddoc.reduceFunctionOfViewNamed('vu') === reduce, "incorrect reduce function");
        assert(ddoc.language === 'javascript', "incorrect ddoc language");
        assert(ddoc.changed, "design doc should show up as changed");
        
        ddoc.saveChanges();
        
        ddoc.defineView('vu', null); // deletes the view
        assert(ddoc.viewNames.length === 0, "got non-zero view name array after deleting view: "+ddoc.viewNames.join(','));
        assert(ddoc.changed, "ddoc should be changed after deleting view");
        
        ddoc.saveChanges();
        assert(!ddoc.changed, "ddoc should not be changed after saving");
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }

    db.deleteDatabase();
}