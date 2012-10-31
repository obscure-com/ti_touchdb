Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.titouchdb');

exports.run_tests = function() {
    var db = server.databaseNamed('test03d');
    db.create();

    try {
        docProperties = [];
        
        for (var i=0; i < 5; i++) {
            var p = (function(index){
                return {
                  _id: 'doc-' + index,
                  order: index
                };
            })(i);
            docProperties.push(p);
        }
        
        Ti.API.info(JSON.stringify(docProperties));
        db.putChanges(docProperties);
        
        for (var i=0; i < 5; i++) {
          var id = 'doc-'+i;
          var doc = db.documentWithID(id);
          Ti.API.info("loaded doc "+i+" "+JSON.stringify(doc.properties));
          assert(doc, 'missing doc '+id);
          assert(doc.currentRevisionID, 'missing currentRevisionID for '+id+'; probably not saved under that ID');
          assert(doc.currentRevisionID.indexOf('1-') == 0, "expected first revision to start with 1-");
          assert(doc.properties.order === i, 'incorrect doc order: '+doc.properties.order+', should be '+i);
        }
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }

    db.deleteDatabase();
}