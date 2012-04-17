Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.TiTouchDB');

exports.run_tests = function() {
    return;
    
    /*
     * Validation isn't implemented yet because there doesn't seem to be a hook
     * in TouchDB-iOS for setting a non-block validation function.
     */
    
    var db = server.databaseNamed('test13b');
    db.create();

    try {
        var ddoc = db.designDocumentWithName('mydesign');
        ddoc.validation = "function(doc,oldDoc,user){if(!doc.groovy) throw({forbidden:'uncool'});}";
        ddoc.saveChanges();
        
        var props = {
            groovy: "right on",
            foo: "bar",
        };
        
        var doc = db.untitledDocument();
        doc.putProperties(props);
        
        delete props.groovy;
        doc = db.untitledDocument();
        var err = doc.putProperties(props);
        assert(err, "did not return anything from putProperties");
        assert(err.code == 403, "incorrect error code on validation: "+err.code);
        assert(err.description == "forbidden: uncool", "incorrect error message on validation: "+err.description);
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }

    db.deleteDatabase();
}