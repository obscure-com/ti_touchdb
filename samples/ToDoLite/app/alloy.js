

(function() {
  var sync = require('lib/sync');
  var cblSync;
  
  /*
   * Configure sync and trigger it if the user is already logged in. 
   */
  
  function updateMyLists(userID, userData) {
    // create a new profile document
    // TODO figure out a way to construct the _id value in the sync adapter
    var profile = Alloy.createModel('profile', { name: userData.name, user_id: userID });
    profile.id = "p:" + userID;
    Alloy.Collections.list.updateAllListsWithOwner(profile.id);
    profile.save();
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
  
  // equivalent to adding a property to AppDelegate
  Alloy.Globals.cblSync = cblSync;
  
})();
