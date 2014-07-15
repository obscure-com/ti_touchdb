/**
 * Synchronization manager module.
 * 
 * This module keeps track of the push and pull replications for a
 * database and holds references to any long-lived objects related
 * to sync.
 */

var titouchdb = require('com.obscure.titouchdb'),
    manager = titouchdb.databaseManager;

var fb = require('facebook');

// SYNC MANAGER

function SyncManager(dbname, url, userID) {
  this.database = manager.getDatabase(dbname);
  this.userID = userID || Ti.App.Properties.getString('sync_manager.userid');
  this.replicationURL = url;
  
  // privileged methods
  
  this.defineSync = _defineSync;
  this.setupNewUser = _setupNewUser;
  this.launchSync = _launchSync;
  this.runBeforeSyncStart = _runBeforeSyncStart;
  this.replicationProgress = _replicationProgress;
  
  // TODO store user ID before first sync
}

// PUBLIC METHODS

SyncManager.prototype.start = function() {
  if (!this.userID) {
    var self = this;
    this.setupNewUser(function() {
      self.launchSync();
    });
  }
  else {
    this.launchSync();
  }
};

SyncManager.prototype.restartSync = function() {
  this.pull.stop();
  this.pull.start();
  this.push.stop();
  this.push.start();
  Ti.API.info("restartSync");
};

SyncManager.prototype.setAuthenticator = function(authenticator) {
  this.authenticator = authenticator;
  authenticator.setSyncManager(this);
};

SyncManager.prototype.beforeFirstSync = function(cb) {
  this.beforeSyncBlocks = (this.beforeSyncBlocks || []).concat([cb]);
};

SyncManager.prototype.onSyncConnected = function(cb) {
  this.onSyncStartedBlocks = (this.onSyncStartedBlocks || []).concat([cb]);
};

// PRIVATE METHODS

function _setupNewUser(cb) {
  if (this.userID) return;
  
  var self = this;
  this.authenticator && this.authenticator.getCredentials(function(uid, userData) {
    Ti.API.info("got userID "+uid);
    self.userID = uid;
    var err = self.runBeforeSyncStart(uid, userData);
    if (err) {
      Ti.API.error(err);
    }
    else {
      _.isFunction(cb) && cb();
    }
    Ti.API.info("setupNewUser");
  });
}

function _defineSync() {
  this.pull = this.database.createPullReplication(this.replicationURL);
  this.pull.continuous = true;
  this.pull.addEventListener('change', this.replicationProgress);
  
  this.push = this.database.createPushReplication(this.replicationURL);
  this.push.continuous = true;
  this.push.addEventListener('change', this.replicationProgress);
  
  this.authenticator.registerCredentialsWithReplications([this.pull, this.push]);
  
  Ti.API.info("defineSync");
}

function _runAuthenticator() {
  this.authenticator && this.authenticator.getCredentials(function(uid, userData) {
    if (uid !== this.userID) {
      throw("cannot change userID from " + this.userID + " to " + uid + "; need to reinstall");
    }
    this.restartSync();
    Ti.API.info("runAuthenticator");
  });
}

function _launchSync() {
  this.defineSync();
  if (this.lastAuthError) {
    this.runAuthenticator();
  }
  else {
    this.restartSync();
  }
  Ti.API.info("launchSync");
}

function _runBeforeSyncStart(uid, userData) {
  var err;
  _.each(this.beforeSyncBlocks, function(b) {
    if (_.isFunction(b)) {
      err = b(uid, userData);
      Ti.API.info("ran pre-sync block");
    }
    if (err) return err;
  });

  Ti.API.info("runBeforeSyncStart");
  return err;
}

function _replicationProgress(e) {
  // TODO
  Ti.API.info("replication progress "+JSON.stringify(e));
}

// FACEBOOK AUTHENTICATOR

function FacebookAuthenticator(appid) {
  fb.appid = appid;
  fb.permissions = ["public_profile", "user_friends", "email"];
}

FacebookAuthenticator.prototype.setSyncManager = function(syncManager) {
  this.syncManager = syncManager;
};


FacebookAuthenticator.prototype.getCredentials = function(cb) {
  var f = function(e) {
    if (e.success) {
      _.isFunction(cb) && cb(e.data.email, e.data);
    }
    fb.removeEventListener('login', f);
  };
  fb.addEventListener('login', f);
  fb.authorize();
};

FacebookAuthenticator.prototype.registerCredentialsWithReplications = function(repls) {
  if (fb.loggedIn) {
    _.each(repls, function(r) {
      r.authenticator = titouchdb.createFacebookAuthenticator(fb.accessToken);
    });
  }
  else {
    Ti.API.warn("could not set authenticators for replications: not logged in");
  }
};

// PUBLIC API

exports.createSyncManager = function(opts) {
  return new SyncManager(opts.database, opts.url, opts.user);
};

exports.createFacebookAuthenticator = function(opts) {
  return new FacebookAuthenticator(opts.appid);
};
