Ti.include('test_utils.js')

var _ = require('underscore'),
    touchdb = require('com.obscure.titouchdb');

exports.run_tests = function() {
  var mgr = touchdb.databaseManager;
  var db = mgr.createDatabaseNamed('test009');
  
  try {
    var view = db.viewNamed('vu');
    assert(view, 'db.viewNamed() returned null');
    assert(view.name === 'vu', 'returned incorrect view name: '+view.name);
    
    // String.format("%02d", i) outputs '00' every time??!?!
    function genname(str, n) {
      return str + (n < 10 ? '0' + n : n);
    }
    
    view.setMap(function(doc, emit) {
      emit(doc.name, doc.i);
    }, '1');

    for (i=0; i < 50; i++) {
      createDocWithProperties(db, {
        name: genname('test', i),
        i: i
      });
    }
    
    (function() {
      var rows = view.query().rows();
      assert(rows, 'no rows for view query');
      assert(rows.count == 50, 'incorrect number of rows: '+rows.count);

      for (i=0; i < 50; i++) {
        var row = rows.rowAtIndex(i);
        assert(row.key === genname('test', i), 'incorrect row key: '+row.key+", should be "+genname('test', i));
        assert(row.value === i, 'incorrect row value: '+row.value);
      }
    })();
    
    (function() {
      // test query parameters
      var query = view.query();
      query.limit = 10;
      query.skip = 10;
      var rows = query.rows();
      assert(rows.count === 10, 'incorrect number of rows returned (limit): '+rows.count);
      for (var i=0; i < 10; i++) {
        var row = rows.rowAtIndex(i);
        assert(row.key === genname('test', i+query.skip), 'incorrect row key: '+row.key+", should be "+genname('test', i+query.skip));
        assert(row.value === i+query.skip, 'incorrect row value: '+row.value);
      }
    })();
    
    (function(){
      var query = view.query();
      query.startKey = 'test22';
      query.endKey = 'test28';
      var rows = query.rows();
      assert(rows.count === 7, 'incorrect number of rows returned (startkey): '+rows.count);
      for (var i=0; i < 7; i++) {
        var row = rows.rowAtIndex(i);
        assert(row.key === genname('test', i+22), 'incorrect row key: '+row.key+", should be "+genname('test', i+22));
        assert(row.value === i+22, 'incorrect row value: '+row.value);
      }
      
    })();
    
    (function(){})();
    (function(){})();
    
    db.deleteDatabase();
  }
  catch (e) {
    db.deleteDatabase();
    throw e;
  }

}  