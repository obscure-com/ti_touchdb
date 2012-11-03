Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.titouchdb');

exports.run_tests = function() {
    var db = server.databaseNamed('test13d');
    db.create();

    try {
        for (i=0; i < 10; i++) {
          createDocWithProperties(db, {
            title: 'title-' + i,
            author: 'author-' + i,
          }, String.format('doc-%d', i));
        }
        
        var ddoc = db.designDocumentWithName('mydesign');
        ddoc.defineView('vu', 'function(doc){emit([doc.author, doc.title],null);}');
        ddoc.saveChanges();
        
        var query = ddoc.queryViewNamed('vu');
        var result = query.rows();
        assert(result, "missing rows from query result");
        assert(result.rowCount == 10, "wrong number of rows returned: "+result.rowCount);
        
        var update = db.documentWithID('doc-5');
        var props = update.properties;
        props.title = 'CouchDB: The Definitive Guide';
        update.putProperties(props);
        
        var query2 = ddoc.queryViewNamed('vu');
        var result2 = query.rows();
        assert(result2, "missing rows from re-query");
        assert(result2.rowCount == 10, "wrong number of rows returned in re-query: "+result2.rowCount);
        var found = false;
        while (row = result2.nextRow()) {
          if (row.key[1] === 'CouchDB: The Definitive Guide') {
            found = true;
            break;
          }
        }
        assert(found, "did not get updated document in re-query");
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }

    db.deleteDatabase();
}
