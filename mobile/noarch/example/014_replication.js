Ti.include('test_utils.js')

var _ = require('underscore'),
    touchdb = require('com.obscure.titouchdb');

exports.run_tests = function() {
  var mgr = touchdb.databaseManager;
  var db = mgr.databaseNamed('test014');
  
  
  var pullTotal = 0, pullCompleted = 0;
  var pushTotal = 0, pushCompleted = 0;
  var pullDone = false, pushDone = false, checkCount = 20;
  
  try {
    Ti.API.info("starting replication test");
    
    var dt = new Date();
    createDocWithProperties(db, {
      testname: 'push_to_remote',
      timestamp: dt.getTime() / 1000,
    }, 'zzz');
    
    var pull = db.replicationFromURL('http://touchbooks.iriscouch.com/test');
    pull.addEventListener('change', function(e) {
      assert(!pull.error, "replication error: "+JSON.stringify(pull.error));
      pullDone = !!(!pull.running && (pull.completed >= pull.total));
    });
    
    // check the replication list
    var repls = db.allReplications;
    assert(repls, "allReplications returned null");
    assert(repls.length === 1, "allReplications returned incorrect number of replications: "+repls.length);
    assert(repls[0].remoteURL === pull.remoteURL, "allReplications remote URL is wrong: "+repls[0].remoteURL);
    
    pull.start();
    
    // just do pull replication for now
    pushDone = true;

/*
    var push = db.replicationToURL('http://touchbooks.iriscouch.com/test');
    push.addEventListener('change', function(e) {
      assert(!push.error, "replication error: "+JSON.stringify(push.error));
      pushDone = !!(!push.running && (push.completed >= push.total));
    });
    push.start();
*/
  }
  catch (e) {
    db.deleteDatabase();
    throw e;
  }
  
  Ti.API.info("replication started");

  // TODO maybe launch replication in a timeout and block on the check?
  var interval = setInterval(function() {
    if (pullDone && pushDone) {
      Ti.API.info("replication done!  doc count = "+db.documentCount);
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