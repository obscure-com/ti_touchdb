/**
 * Asynchronous CouchDb client for Appcelerator Titanium
 *
 * (c) 2011 Paul Mietz Egli
 * Licensed under the Apache License version 2.0
 */

var shift = Array.prototype.shift;
var slice = Array.prototype.slice;

exports.CouchClient = function() {
  var args = slice.call(arguments);
  this.base_url = args.shift() || 'http://127.0.0.1:5984';
  this.auth = args.shift() || null;
  this.debug = args.shift() || false;
  
  // clean up base_url
  this.base_url = this.base_url.replace(/\/$/, ''); // strip trailing slash
};

// server-level miscellaneous methods

exports.CouchClient.prototype.active_tasks = function(callback) {
  this._request('GET', '_active_tasks', callback);
};

exports.CouchClient.prototype.all_dbs = function(callback) {
  this._request('GET', '_all_dbs', callback);
};

exports.CouchClient.prototype.stats = function(callback) {
  this._request('GET', '_stats', callback);
};

exports.CouchClient.prototype.uuids = function(n, callback) {
  var args = shift.call(arguments),
      callback = _pop_callback(args),
      n = args.shift() || 1;
  
  this._request('GET', '_uuids', { n: n }, callback);
};

// server configuration

exports.CouchClient.prototype.config = function(callback) {
  throw { message: 'config not implemented' };
};

// database object

exports.CouchClient.prototype.database = function(name) {
  var that = this, server = this;
  
  return {
    name: name,
    query: function(method, path /*, [options], [data], [headers], callback */) {
      var args = slice.call(arguments, 2);
      server._request.apply(server, [method, [_esc(name), path].join('/')].concat(args));
    },
    exists: function(callback) {
      this.query('HEAD', '', function(body, status, contentType) {
        if (status === 200) {
          callback(true);
        }
        else if (status === 404) {
          callback(false);
        }
        else {
          callback(body, status, contentType);
        }
      });
    },
    create: function(callback) {
      this.query('PUT', '', callback);
    },
    destroy: function(callback) {
      this.query('DELETE', '', callback);
    },
    info: function(callback) {
      this.query('GET', '', callback);
    },
    all: function(/* options, */ callback) {
      var args = slice.call(arguments),
          callback = _pop_callback(args),
          options = args.shift();
      
      this.query('GET', '_all_docs', options, callback);
    },
    fetch: function(docid, /* [docrev], */ callback) {
      var args = slice.call(arguments),
          options = null,
          docrev = arguments.length === 3 ? args[1] : null;

      callback = _pop_callback(args);
      
      if (Array.isArray(docid)) {
        // bulk get
        this.query('POST', '_all_docs', { include_docs: true }, { keys: docid }, callback);
      }
      else {
        if (typeof(docrev) === 'string') {
          options = { rev: docrev };
        }
        this.query('GET', _esc(docid), options, callback);
      }
    },
    save: function(/* [id], [rev], doc | [doc, ...], */ callback) {
      var args = slice.call(arguments, 0),
          doc, id, rev;
      
      callback = _pop_callback(args);
      
      if (Array.isArray(args[0])) {
        // bulk save
        doc = args[0];
      }
      else {
        doc = args.pop();
        id = args.shift();
        rev = args.shift();
      }
      this._save(id, rev, doc, callback);
    },
    _save: function(id, rev, doc, callback) {
      var document = {};
      
      if (Array.isArray(doc)) {
        document.docs = doc;
        this.query('POST', '_bulk_docs', {}, document, callback);
      }
      else {
        // TODO design docs?
        if (id) {
          document = doc;
          rev && (document._rev = rev);
          // if rev is missing and the doc isn't new, this will fail!
          this.query('PUT', _esc(id), null, doc, callback);
        }
        else {
          this.query('POST', '', {}, document, callback);
        }
      }
    },
    merge: function(/* [id], doc, */ callback) {
      var that = this,
          args = slice.call(arguments),
          callback = _pop_callback(args),
          doc = args.pop(),
          id = args.pop() || doc._id;
      
      this.query('GET', _esc(id), function(res, status, contentType) {
        if (status === 200) {
          doc = _combine(res, doc);
          that.save(id, res._rev, doc, callback);
        }
        else {
          callback(res, status, contentType);
        }
      })
    },
    remove: function(id, rev, callback) {
      this.query('DELETE', _esc(id), { rev: rev }, callback);
    },
    attachment_url: function(id, attachment_name) {
      return [server.base_url, _esc(this.name), _esc(id), _esc(attachment_name)].join('/');
    },
    view: function(path, /* [options], */ callback) {
      var args = slice.call(arguments),
          callback = _pop_callback(args),
          path = args.shift(),
          options = args.shift();
      
      path = path.split('/');
      path = ['_design', _esc(path[0]), '_view', _esc(path[1])].join('/');
      
      _process_view_options(options);
      
      if (options && options.keys) {
        this.query('POST', path, {}, options, callback);
      }
      else {
        this.query('GET', path, options, callback);
      }
    },
    list: function(path, /* [options], */ callback) {
      var args = slice.call(arguments),
          callback = _pop_callback(args),
          path = args.shift(),
          options = args.shift();
      
      path = path.split('/');
      path = ['_design', _esc(path[0]), '_list', _esc(path[1]), _esc(path[2])].join('/');
      
      _process_view_options(options);
      
      this.query('GET', path, options, callback);
    },
    show: function(docid, show, callback) {
      var path = ['_design', _esc(show), '_show', _esc(docid)].join('/');
      this.query('GET', path, callback);
    },
    replicate: function(target, options, callback) {
      throw { message: 'replicate not implemented' };
    },
    compact: function(callback) {
      throw { message: 'compact not implemented' };
    },
    view_cleanup: function(callback) {
      throw { message: 'view_cleanup not implemented' };
    },
  }
};


// low-level HTTP request
// callback(body, [status], [content-type])
exports.CouchClient.prototype._request = function(method, path, /* [options], [data], [headers] */ callback) {
  var that = this, args = slice.call(arguments, 2);
  
  callback = _pop_callback(args);
  method = (method || 'GET').toUpperCase();
  
  var options = args.shift() || {},
      data = args.shift(),
      headers = args.shift() || {};

  if (options && Object.keys(options).length) {
    var pairs = [];
    for (var k in options) {
      if (typeof(options[k]) === 'boolean') {
        options[k] = String(options[k]);
      }
      pairs.push([_esc(k),_esc(options[k])].join('='));
    }
    path += '?' + pairs.join('&');
  }
  
  if (data) {
    data = JSON.stringify(data, function(k, val) {
      return typeof(val) === 'function' ? val.toString() : val;
    });
    headers['Content-Type'] = 'application/json';
  }
  
  if (this.auth) {
    headers['Authorization'] = 'Basic ' + _b64(this.auth['username'] + ':' + this.auth['password']);
  }
  
  headers['Accept'] = 'application/json';
  
  var client = Ti.Network.createHTTPClient({
    timeout: 2000,
    onload: function() {
      that.debug && Ti.API.info('response: '+this.status+' '+this.responseText);
      var json;
      var contentType = this.getResponseHeader('Content-Type');
      if (contentType === 'application/json') {
        try {
          json = JSON.parse(this.responseText);
          callback(json, this.status, contentType)
        }
        catch (e) {
          callback(e, this.status, contentType);
        }
      }
      else {
        callback(this.responseText, this.status, contentType)
      }
    },
    onerror: function() {
      that.debug && Ti.API.info('response: '+this.status+' '+this.responseText);
      callback(this.responseText, this.status, this.getResponseHeader('Content-Type'));
    },
  });
  
  var url = [this.base_url, path].join('/');
  client.open(method, url);
  this.debug && Ti.API.info(method + ' '+url);
  
  for (var i in headers) {
    client.setRequestHeader(i, headers[i]);
  }
  client.send(data);
  this.debug && Ti.API.info('request: '+JSON.stringify(data));
};

// static helper functions

function _process_view_options(options) {
  if (typeof(options) === 'object') {
    for (var i in ['key', 'startkey', 'endkey']) {
      if (i in options) {
        options[i] = JSON.stringify(options[i]);
      }
    }
  }
}

var empty = {};

function _mixin(target, source) {
  var name, s, i;
  for(name in source){
    s = source[name];
    if(!(name in target) || (target[name] !== s && (!(name in empty) || empty[name] !== s))){
      target[name] = s;
    }
  }
  return target; // Object
}

function _combine(obj /*, obj, obj... */) {
  var target = {};
  for (var i=0, l=arguments.length; i < l; i++) {
    _mixin(target, arguments[i])
  }
  return target;
};

function _pop_callback(args) {
  var callback;
  if (typeof(callback = args.pop()) !== 'function') {
    args.push(callback);
    callback = function() {};
  }
  return callback;
}

function _esc(str) {
  return Ti.Network.encodeURIComponent(str);
}

function _b64(str) {
  return Ti.Utils.base64encode(str);
}
