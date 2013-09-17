Ti.include('test_utils.js')

var _ = require('underscore'),
    touchdb = require('com.obscure.titouchdb');

exports.run_tests = function() {
  var mgr = touchdb.databaseManager;
  var db = mgr.createDatabaseNamed('test015');
  
  // filtered push replication
  db.defineFilter('books_only', function(rev) {
    return rev.type === 'book';
  });
  
  var checkCount = 20, push, lastmode = -1, pushComplete;
  
  try {
    createDocWithProperties(db, {
      testname: '015',
      type: 'book',
      title: 'Design Patterns'
    }, "0-201-63361-2");
    createDocWithProperties(db, {
      testname: '015',
      type: 'book',
      title: 'Envisioning Information'
    }, "0-9613921-1-8");
    createDocWithProperties(db, {
      testname: '015',
      type: 'magazine',
      title: 'National Geographic'
    }, "9781426203862");
    
    push = db.pushToURL('http://touchbooks.iriscouch.com/test015');
    push.addEventListener('change', function(e) {
      pushComplete = !!(!push.running && (push.completed >= push.total));
    })
    push.filter = 'books_only';
    push.start();
  }
  catch (e) {
    db.deleteDatabase();
    throw e;
  }
  
  // TODO maybe launch replication in a timeout and block on the check?
  var interval = setInterval(function() {
    if (pushComplete) {
      Ti.API.info("replication done!");
      clearInterval(interval);
      db.deleteDatabase();
    }
    else if (checkCount-- < 0) {
      clearInterval(interval);
      db.deleteDatabase();
      throw new Error("timed out waiting for replication");
    }
  }, 2000);
  

}