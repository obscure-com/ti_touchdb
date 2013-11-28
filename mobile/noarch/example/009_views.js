Ti.include('test_utils.js')

var _ = require('underscore'),
    touchdb = require('com.obscure.titouchdb');

exports.run_tests = function() {
  var mgr = touchdb.databaseManager;
  var db = mgr.databaseNamed('test009');
  
  try {
    // String.format("%02d", i) outputs '00' every time??!?!
    function genname(str, n) {
      return str + (n < 10 ? '0' + n : n);
    }
    
    for (i=0; i < 50; i++) {
      createDocWithProperties(db, {
        name: genname('test', i),
        i: i,
        dt: [2013, 1, 3]
      });
    }
    
    (function() {
      var view = db.viewNamed('vu');
      assert(view, 'db.viewNamed() returned null');
      assert(view.name === 'vu', 'returned incorrect view name: '+view.name);

      view.setMap(function(doc) {
        emit(doc.name, doc.i);
      }, '1');

    
      (function() {
        var rows = view.createQuery().rows();
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
        var query = view.createQuery();
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
        var query = view.createQuery();
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
    })();
    
    (function(){
      // complex keys
      var view = db.viewNamed('complexView');
      assert(view, 'db.viewNamed() returned null');
      assert(view.name === 'complexView', 'returned incorrect view name: '+view.name);

      view.setMap(function(doc) {
        emit([doc.name, doc.i % 3], null);
      }, '1');
      
      var rows = view.createQuery().rows();
      assert(rows, 'no rows for view query');
      assert(rows.count == 50, 'incorrect number of rows: '+rows.count);

      for (i=0; i < 50; i++) {
        var row = rows.rowAtIndex(i);
        assert(_.isArray(row.key), 'row key is not an array: '+row.key);
        assert(row.key0 === genname('test', i), 'incorrect row key0 at row '+i+': '+row.key0+", should be "+genname('test', i));
        assert(row.key1 === i % 3, 'incorrect row key1 at row '+i+': '+row.key1+", should be "+(i % 3));
        assert(row.value === null, 'incorrect row value: '+row.value);
      }
    })();
    
    (function(){
      // reduce
      var view = db.viewNamed('reducedView');

      view.setMapAndReduce(
        function(doc) {
          emit("foo", 1);
        },
        function(keys, values, rereduce) {
          var sum = 0;
          for (i=0; i < values.length; i++) {
            sum += values[i];
          }
          return sum;
        },
        '1'
      );
      
      var query = view.createQuery();
      query.groupLevel = 1;
      var rows = query.rows();
      assert(rows, 'missing rows from map/reduce query');
      assert(rows.count == 1, 'incorrect number of rows: '+rows.count);
      var row = rows.rowAtIndex(0);
      assert(row, "missing first row");
      assert(row.value == 50, "incorrect sum value: "+row.value);
    })();

    db.deleteDatabase();
  }
  catch (e) {
    db.deleteDatabase();
    throw e;
  }

}  