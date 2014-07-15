

(function() {
  var sync = require('lib/sync');
  var cblSync;
  
  /*
   * Configure sync and trigger it if the user is already logged in. 
   */
  
  function updateMyLists(userID, userData) {
    // TODO set up a profile document
    // TODO tag all lists created before login with the userID
    Ti.API.info("update my lists");
  }  

  // public 
  Alloy.Globals.loginAndSync = function(cb) {
    if (cblSync.userID) {
      _.isFunction(cb) && cb();
    }
    else {
      cblSync.beforeFirstSync(cb);
      cblSync.start();
    }
  };

  // run at startup to load up the sync manager for the database and remote URL
  cblSync = sync.createSyncManager({
    database: Alloy.CFG.dbname,
    url:      Ti.App.Properties.getString('com.couchbase.todolite.syncurl', 'http://localhost:4984/todos'),
  });
  
  // set the authenticator on the sync manager
  cblSync.setAuthenticator(sync.createFacebookAuthenticator({
    appid: Ti.App.Properties.getString('ti.facebook.appid')
  }));
  
  if (cblSync.userID) {
    cblSync.start();
  }
  else {
    cblSync.beforeFirstSync(function(userID, userData, err) {
      updateMyLists(userID, userData);
    });
  }
  
})();
