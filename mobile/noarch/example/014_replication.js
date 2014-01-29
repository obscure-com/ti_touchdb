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
    
    var pull = db.createPullReplication('http://touchbooks.iriscouch.com/test');
    pull.addEventListener('change', function(e) {
      assert(!pull.lastError, "replication error: "+JSON.stringify(pull.lastError));
      pullDone = !!(!pull.running && (pull.completedChangesCount >= pull.changesCount));
      Ti.API.info("running "+pull.running+" completed "+pull.completedChangesCount+" total "+pull.changesCount);
    });
    
    // check the replication list
    var repls = db.allReplications;
    assert(repls, "allReplications returned null");
    assert(repls.length === 0, "allReplications returned incorrect number of replications: "+repls.length);

    pull.start();
    
    repls = db.allReplications;
    assert(repls, "allReplications returned null");
    assert(repls.length === 1, "allReplications returned incorrect number of replications: "+repls.length);
    assert(repls[0].remoteURL === pull.remoteURL, "allReplications remote URL is wrong: "+repls[0].remoteURL);
    
    // just do pull replication for now
    pushDone = true;

/*
    var push = db.createPushReplication('http://touchbooks.iriscouch.com/test');
    push.addEventListener('change', function(e) {
      assert(!push.lastError, "replication error: "+JSON.stringify(push.lastError));
      pushDone = !!(!push.running && (push.completedChangesCount >= push.changesCount));
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