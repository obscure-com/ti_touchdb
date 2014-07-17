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
  
  this.beforeFirstSync(function(uid, userData) {
    Ti.App.Properties.setString('sync_manager.userid', uid);
    Ti.API.info("stored userid "+uid);
  });
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

SyncManager.prototype.beforeFirstSync = function(cb) {
  this.beforeSyncBlocks = (this.beforeSyncBlocks || []).concat([cb]);
};

SyncManager.prototype.onSyncConnected = function(cb) {
  this.onSyncStartedBlocks = (this.onSyncStartedBlocks || []).concat([cb]);
};

SyncManager.prototype.setAuthenticator = function(authenticator) {
  this.authenticator = authenticator;
  authenticator.setSyncManager(this);
  if (this.lastAuthError) {
    this.runAuthenticator();
  }
};

// PRIVATE METHODS

function _setupNewUser(cb) {
  if (this.userID) return;
  
  var self = this;
  this.authenticator && this.authenticator.getCredentials(function(uid, userData) {
    self.userID = uid;
    var err = self.runBeforeSyncStart(uid, userData);
    if (err) {
      Ti.API.error(err);
    }
    else {
      _.isFunction(cb) && cb();
    }
  });
}

function _runBeforeSyncStart(uid, userData) {
  var err;
  _.each(this.beforeSyncBlocks, function(b) {
    if (_.isFunction(b)) {
      err = b(uid, userData);
    }
    if (err) return err;
  });

  return err;
}

function _runAuthenticator() {
  this.authenticator && this.authenticator.getCredentials(function(uid, userData) {
    if (uid !== this.userID) {
      throw("cannot change userID from " + this.userID + " to " + uid + "; need to reinstall");
    }
    this.restartSync();
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
}

function _defineSync() {
  this.pull = this.database.createPullReplication(this.replicationURL);
  this.pull.continuous = true;
  this.pull.addEventListener('change', this.replicationProgress);
  
  this.push = this.database.createPushReplication(this.replicationURL);
  this.push.continuous = true;
  this.push.addEventListener('change', this.replicationProgress);
  
  this.authenticator.registerCredentialsWithReplications([this.pull, this.push]);
}

function _replicationProgress(e) {
  // this is run for pull and push independently
  var active = false;
  var completed = 0, total = 0;
  var status = titouchdb.REPLICATION_MODE_STOPPED;
  var error;

  var repl = e.source;
  status = Math.max(status, repl.status);
  if (!error) {
    error = repl.lastError;
  }
  if (repl.status === titouchdb.REPLICATION_MODE_ACTIVE) {
    active = true;
    completed += repl.completedChangesCount;
    total += repl.changesCount;
  }
  
  if (error && error.code === 401) {
    if (!this.authenticator) {
      this.lastAuthError = error;
      return;
    }
    this.runAuthenticator();
  }
  
  if (active !== this.active || completed !== this.completed || total !== this.total || error !== this.error) {
    this.active = active;
    this.completed = completed;
    this.total = total;
    this.error = error;
    this.progress = (completed / Math.max(total, 1));
    
    Ti.API.info(String.format("SyncManager: active=%s; status=%d; %d/%d; " + (error ? JSON.stringify(error) : ""), active ? "true" : "false", status, completed, total));

    // fire an event to notify the app that the data may have changed
    Ti.App.fireEvent('sync:change', {});
  }
  
}

// FACEBOOK AUTHENTICATOR

function FacebookAuthenticator(appid) {
  fb.appid = appid;
  fb.permissions = ["public_profile", "user_friends", "email"];
  fb.forceDialogAuth = false;
}

FacebookAuthenticator.prototype.setSyncManager = function(syncManager) {
  this.syncManager = syncManager;
};


FacebookAuthenticator.prototype.getCredentials = function(cb) {
  // if the user is logged in, the Ti Facebook module skips the
  // call to authorize().  In this case, we make a graph API call
  // to get the user data.
  if (fb.loggedIn) {
    fb.requestWithGraphPath('/me', { fields: "id,name,email" }, 'GET', function(e) {
      if (e.success) {
        var data = JSON.parse(e.result);
        _.isFunction(cb) && cb(data.email, data);
      }
    });
  }
  else {
    var f = function(e) {
      if (e.success) {
        _.isFunction(cb) && cb(e.data.email, e.data);
      }
      fb.removeEventListener('login', f);
    };
    fb.addEventListener('login', f);
    fb.authorize();
  }
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
