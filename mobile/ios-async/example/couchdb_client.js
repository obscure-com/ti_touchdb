/** @module com.obscure.couchdb_client */

/**
* @fileOverview
* CouchDB client module for Appcelerator Titanium.  All of the functions
* in this module are asynchronous and use an options object for common
* parameters.
* @see options
*/

/**
* @name options
* @field
* @property {Function} success called by the module when the CouchDB call completes
*    successfully.  The parameter to this function is the response from CouchDB
*    as an object.
* @property {Function} failure called by the module when the CouchDB call fails for
*    any reason.  The parameter to this function is the XMLHttpRequest object used
*    in the call.  You can extract the response code and error messages from that XHR.
* @property {String} username the username to use during the call.  Some CouchDB calls
*    require an admin user; depending on your security setup, other calls may also
*    require a valid user.
* @property {String} password the password to use during the call.
*/

/** @private */
function userDb(callback) {
  exports.session({
    success: function(resp) {
      var userDb = exports.db(resp.info.authentication_db);
      callback(userDb);
    }
  });
}

/** @private */
function prepareUserDoc(user_doc, new_password) {
  if (typeof hex_sha1 == "undefined") {
    Ti.API.error("creating a user doc requires sha1.js to be loaded in the page");
    return;
  }
  var user_prefix = "org.couchdb.user:";
  user_doc._id = user_doc._id || user_prefix + user_doc.name;
  if (new_password) {
    // handle the password crypto
    user_doc.salt = _newUUID();
    user_doc.password_sha = hex_sha1(new_password + user_doc.salt);
  }
  user_doc.type = "user";
  if (!user_doc.roles) {
    user_doc.roles = [];
  }
  return user_doc;
}

/** @private */
function encodeDocId(docID) {
  var parts = docID.split("/");
  if (parts[0] == "_design") {
    parts.shift();
    return "_design/" + encodeURIComponent(parts.join('/'));
  }
  return encodeURIComponent(docID);
}

/** @private */
var viewOptions = [
  "key", "startkey", "startkey_docid", "endkey", "endkey_docid", "limit",
  "stale", "descending", "skip", "group", "group_level", "reduce",
  "include_docs", "inclusive_end"
];

/** @private */
function encodeViewOptions(obj) {
  // http://wiki.apache.org/couchdb/HTTP_view_API
  // note that "keys" is handled separately
  var buf = [];
  for (var key in obj) {
    if (inArray(key, viewOptions) > -1) {
      buf.push(encodeURIComponent(key) + "=" + encodeURIComponent(JSON.stringify(obj[key])));
    }
  }
  return buf.join('&');
}


/**
 * base URL of the CouchDB server, i.e. 'http://localhost:5984'
 */
exports.urlPrefix = '';

// public functions

/**
 * Fetch a list of all databases.
 * @param options request options
 */
exports.allDbs = function(options) {
  ajax({
    url: this.urlPrefix + "/_all_dbs"
  }, options);
};

/**
 * Get information about the server or a database (add "dbname" field to the options object).
 * @param options request options
 */
exports.info = function(options) {
  ajax({
    url: this.urlPrefix + "/" + (options.dbname || "")
  }, options);  
};

exports.config = function(options, section, key, value) {
  var req = { url: this.urlPrefix + "/_config/" };
  if (section) {
    req.url += encodeURIComponent(section) + "/";
    if (key) {
      req.url += encodeURIComponent(key);
    }
  }
  if (value === null) {
    req.method = "DELETE";        
  }
  else if (value !== undefined) {
    req.method = "PUT";
    req.data = JSON.stringify(value);
  }
  ajax(req, options);  
};

exports.login = function(options, username, password) {
  this.session(extend({ username:username, password:password}, options));
};

exports.logout = function(options) {
  ajax({
    method: "DELETE",
    url: this.urlPrefix + "/_session",
    username: "_",
    password: "_"
  }, options);
};

exports.session = function(options) {
  ajax({
    url: this.urlPrefix + "/_session",
    headers: { "Accept": "application/json" }
  }, options);
};

exports.signup = function(user_doc, password, options) {      
  options = options || {};
  user_doc = prepareUserDoc(user_doc, password);
  userDb(function(db) {
    db.saveDoc(user_doc, options);
  });
};

exports.db = function(name, db_opts) {
  db_opts = db_opts || {};

  return {
    name: name,
    uri: this.urlPrefix + "/" + encodeURIComponent(name) + "/",

    /**
     * Request compaction of the specified database.
     * @param 
     */
    compact: function(options) {
      ajax({
        method: "POST",
        url: this.uri + "_compact",
        successStatus: 202
      }, options);
    },

    /**
     * Cleans up the cached view output on disk for a given view.
     */
    viewCleanup: function(options) {
      ajax({
        method: "POST",
        url: this.uri + "_view_cleanup",
        successStatus: 202
      }, options);
    },

    /**
     * Compacts the view indexes associated with the specified design
     * document. You can use this in place of the full database compaction
     * if you know a specific set of view indexes have been affected by a
     * recent database change.
     */
    compactView: function(groupname, options) {
      ajax({
        method: "POST",
        url: this.uri + "_compact/" + groupname,
        successStatus: 202
        }, options);
    },

    /**
     * Create a new database
     */
    create: function(options) {
      ajax({
        method: "PUT",
        url: this.uri,
        successStatus: 201
      }, options);
    },

    /**
     * Deletes the specified database, and all the documents and
     * attachments contained within it.
     */
    drop: function(options) {
      ajax({
        method: "DELETE",
        url: this.uri
      }, options);
    },

    /**
     * Gets information about the specified database.
     */
    info: function(options) {
      ajax({
        url: this.uri
      }, options);
    },

    /**
     * @namespace
     * $.couch.db.changes provides an API for subscribing to the changes
     * feed
     * <pre><code>var $changes = $.couch.db("mydatabase").changes();
     *$changes.onChange = function (data) {
     *    ... process data ...
     * }
     * $changes.stop();
     * </code></pre>
     */
    /* TODO TODO TODO 
    changes: function(since, options) {

      options = options || {};
      // set up the promise object within a closure for this handler
      var timeout = 100, db = this, active = true,
        listeners = [],
        promise = {
        onChange : function(fun) {
          listeners.push(fun);
        },
        stop : function() {
          active = false;
        }
      };
      // call each listener when there is a change
      function triggerListeners(resp) {
        $.each(listeners, function() {
          this(resp);
        });
      };
      // when there is a change, call any listeners, then check for
      // another change
      options.success = function(resp) {
        timeout = 100;
        if (active) {
          since = resp.last_seq;
          triggerListeners(resp);
          getChangesSince();
        };
      };
      options.error = function() {
        if (active) {
          setTimeout(getChangesSince, timeout);
          timeout = timeout * 2;
        }
      };
      // actually make the changes request
      function getChangesSince() {
        var opts = $.extend({heartbeat : 10 * 1000}, options, {
          feed : "longpoll",
          since : since
        });
        ajax(
          {url: db.uri + "_changes"+encodeOptions(opts)},
          options,
          "Error connecting to "+db.uri+"/_changes."
        );
      }
      // start the first request
      if (since) {
        getChangesSince();
      } else {
        db.info({
          success : function(info) {
            since = info.update_seq;
            getChangesSince();
          }
        });
      }
      return promise;
    },
    */

    /**
     * Fetch all the docs in this db.  You can specify an array of keys to
     * fetch by passing the <code>keys</code> field in the
     * <code>options</code> parameter.
     */
    allDocs: function(options) {
      var method = "GET";
      var data = null;
      if (options["keys"]) {
        method = "POST";
        var keys = options["keys"];
        delete options["keys"];
        data = { "keys": keys };
      }
      ajax({
          method: method,
          data: data,
          url: this.uri + "_all_docs"
      }, options);
    },

    /**
     * Fetch all the design docs in this db
     */
    allDesignDocs: function(options) {
      this.allDocs(extend({ startkey:"_design", endkey:"_design0" }, options));
    },

    /**
     * Returns the specified doc from the db.
     */
    openDoc: function(docId, options) {
      ajax({
        url: this.uri + encodeDocId(docId)
      }, options);
    },

    /**
     * Create a new document in the specified database, using the supplied
     * JSON document structure. If the JSON structure includes the _id
     * field, then the document will be created with the specified document
     * ID. If the _id field is not specified, a new unique ID will be
     * generated.
     */
    saveDoc: function(doc, options) {
      options = options || {};
      var db = this;
      if (doc._id === undefined) {
        var method = "POST";
        var uri = this.uri;
      }
      else {
        var method = "PUT";
        var uri = this.uri + encodeDocId(doc._id);
      }
      ajax({
        method: method,
        url: uri,
        data: doc,
        successStatus: [200, 201, 202]
      }, options);
    },

    /**
     * Save a list of documents
     */
    bulkSave: function(docs, options) {
      ajax({
        method: "POST",
        url: this.uri + "_bulk_docs",
        data: docs,
      }, options);
    },

    /**
     * Deletes the specified document from the database. You must supply
     * the current (latest) revision and <code>id</code> of the document
     * to delete eg <code>removeDoc({_id:"mydoc", _rev: "1-2345"})</code>
     */
    removeDoc: function(doc, options) {
      ajax({
        method: "DELETE",
        data: { rev: doc._rev },
        url: this.uri + encodeDocId(doc._id)
      }, options);
    },

    /**
     * Remove a set of documents
     */
    bulkRemove: function(docs, options){
      docs.docs = each(docs.docs, function(i, doc) {
        doc._deleted = true;
      });
      ajax({
        method: "POST",
        successStatus: 201,
        url: this.uri + "_bulk_docs",
        data: docs
      }, options);
    },

    /**
     * Copy an existing document to a new or existing document.
     */
    copyDoc: function(source, destination, options) {
      if (!destination) {
        // TODO get a UUID
      }
      ajax({
        method: "COPY",
        url: this.uri + encodeDocId(source),
        successStatus: 201,
        headers: { "Destination": destination }
      }, options);
    },

    /**
     * Creates and executes a temporary view.
     */
    query: function(mapFun, reduceFun, language, options) {
      language = language || "javascript";
      if (typeof(mapFun) !== "string") {
        mapFun = mapFun.toSource ? mapFun.toSource() : "(" + mapFun.toString() + ")";
      }
      var body = {language: language, map: mapFun};
      if (reduceFun != null) {
        if (typeof(reduceFun) !== "string")
          reduceFun = reduceFun.toSource ? reduceFun.toSource()
            : "(" + reduceFun.toString() + ")";
        body.reduce = reduceFun;
      }
      ajax({
          method: "POST",
          url: this.uri + "_temp_view",
          data: body,
          headers: { "Content-Type": "application/json" }
        },
        options);
    },


    /**
     * Fetch a _list view output.  You can specify a list of
     * <code>keys</code> in the options object to receive only those keys.
     */
    list: function(list, view, options) {
      var list = list.split('/');
      var method = 'GET';
      var data = null;
      if (options['keys']) {
        method = 'POST';
        var keys = options['keys'];
        delete options['keys'];
        data = {'keys': keys };
      }
      ajax({
        method: method,
        data: data,
        url: this.uri + '_design/' + list[0] + '/_list/' + list[1] + '/' + view
      }, options);
    },

    /**
     * Executes the specified view-name from the specified design-doc
     * design document.  You can specify a list of <code>keys</code>
     * in the options object to recieve only those keys.
     */
    view: function(name, options) {
      var name = name.split('/');
      var method = "GET";
      var data = null;
      if (options["keys"]) {
        method = "POST";
        var keys = options["keys"];
        delete options["keys"];
        data = { "keys": keys };
      }
      ajax({
          method: method,
          data: data,
          url: this.uri + "_design/" + name[0] + "/_view/" + name[1] + '?' + encodeViewOptions(options)
        }, options);
    },

    /**
     * Fetch an arbitrary CouchDB database property.  As of 1.1, only the
     * <code>_revs_limit</code> property is available.
     */
    getDbProperty: function(propName, options) {
      ajax({
        url: this.uri + propName
      }, options);
    },

    /**
     * Set an arbitrary CouchDB database property.  As of 1.1, only the
      * <code>_revs_limit</code> property is available.
     */
    setDbProperty: function(propName, propValue, options) {
      ajax({
        method: "PUT", 
        url: this.uri + propName,
        data : propValue
      }, options);
    }
  }  
};


/**
 * AJAX functions for CouchDB client
 */

function httpData(xhr, type) {
  var contentType = xhr.getResponseHeader("content-type") || "";
  var isXml = type === "xml" || (!type && contentType.indexOf("xml") >= 0);
  var isJson = type === "json" || (!type && contentType.indexOf("json") >= 0);

  var data = isXml ? xhr.responseXML : xhr.responseText;
  if (typeof data === "string") {
    if (isJson) {
      data = JSON.parse(data);
    }
    // other types here?
  }
  return data;
}

function toQueryString(obj) {
  var buf = [];
  for (var name in obj) {
    var value = obj[name];
    if (inArray(name, ["key", "startkey", "endkey"]) >= 0) {
      value = JSON.stringify(value);
    }
    buf.push(encodeURIComponent(name) + "=" + encodeURIComponent(value));
  }
  return buf.length ? buf.join("&") : "";
}

/**
 *
 * opts.method HTTP method to use
 * opts.successStatus default 200; set to 201 for document create
 * opts.data for HTTP GET, the query parameters; otherwise request body
 * opts.headers extra headers to send
 * opts.success function(data) called on success; data is the object returned in the response
 * opts.failure function(xhr) called on failure with XMLHttpRequest object
 */
function ajax(req, opts, xhrOpts) {
  opts = opts || {};
  xhrOpts = xhrOpts || {};

  //var request = extend(req, opts);
  var request = extend({ successStatus: [200], method: "GET" }, req);

  // encode request.data onto URL
  if (request.data && request.method !== "POST" && request.method !== "PUT") {
    request.url += (request.url.indexOf("?") > -1 ? "&" : "?") + toQueryString(request.data);
    delete request.data;
  }

  successStatus = isArray(request.successStatus) ? request.successStatus : Array(request.successStatus);

  var xhr = Ti.Network.createHTTPClient(extend({
    onload: function(e) {
      var req = e.source;
      try {
        var resp = httpData(req, "json");
      }
      catch (err) {
        Ti.API.error(err.name + ": " + err.message);
        if (opts.failure) {
          opts.failure(req);
        }
        else {
          Ti.API.error(err);
        }
      }

      if (inArray(req.status, successStatus) >= 0) {
        if (opts.success) {
          opts.success(resp);
        }
      }
      else if (opts.failure) {
        opts.failure(req);
      }
      else {
        Ti.API.error("bad response: " + req.status + " " + req.responseText);
      }
    },
    onerror: function(e) {
      var req = e.source;
      if (opts.failure) {
        opts.failure(req);
      }
      else {
        Ti.API.error("AJAX error: " + JSON.stringify(e) + " " + req.status + " " + req.responseText);
      }
    }
  }, xhrOpts));

  xhr.open(request.method, request.url);
  Ti.API.debug(request.method + " "+request.url);

  if (xhr.setMaxRedirects) {
    xhr.setMaxRedirects(0);
  }

  // basic auth
  if (opts.username) {
    xhr.setRequestHeader('Authorization', 'Basic ' + Ti.Utils.base64encode(opts.username+':'+opts.password));
  }

  // generic Accept header, may be overwritten below
  xhr.setRequestHeader("Accept", "*/*");

  if (request.method === "POST" || request.method === "PUT") {
    xhr.setRequestHeader("Content-Type", "application/json");
  }

  // extra headers
  if (request.headers) {
    for (var header in request.headers) {
      xhr.setRequestHeader(header, request.headers[header]);
    }
  }

  xhr.send(isPlainObject(request.data) ? JSON.stringify(request.data) : request.data);
}

/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = "="; /* base-64 pad character. "=" for strict RFC compliance   */
var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_sha1(s){return binb2hex(core_sha1(str2binb(s),s.length * chrsz));}
function b64_sha1(s){return binb2b64(core_sha1(str2binb(s),s.length * chrsz));}
function str_sha1(s){return binb2str(core_sha1(str2binb(s),s.length * chrsz));}
function hex_hmac_sha1(key, data){ return binb2hex(core_hmac_sha1(key, data));}
function b64_hmac_sha1(key, data){ return binb2b64(core_hmac_sha1(key, data));}
function str_hmac_sha1(key, data){ return binb2str(core_hmac_sha1(key, data));}

/*
 * Perform a simple self-test to see if the VM is working
 */
function sha1_vm_test()
{
  return hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
}

/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
function core_sha1(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << (24 - len % 32);
  x[((len + 64 >> 9) << 4) + 15] = len;

  var w = Array(80);
  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;
  var e = -1009589776;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    var olde = e;

    for(var j = 0; j < 80; j++)
    {
      if(j < 16) w[j] = x[i + j];
      else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
      var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
                       safe_add(safe_add(e, w[j]), sha1_kt(j)));
      e = d;
      d = c;
      c = rol(b, 30);
      b = a;
      a = t;
    }

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
    e = safe_add(e, olde);
  }
  return Array(a, b, c, d, e);

}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1_ft(t, b, c, d)
{
  if(t < 20) return (b & c) | ((~b) & d);
  if(t < 40) return b ^ c ^ d;
  if(t < 60) return (b & c) | (b & d) | (c & d);
  return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1_kt(t)
{
  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
         (t < 60) ? -1894007588 : -899497514;
}

/*
 * Calculate the HMAC-SHA1 of a key and some data
 */
function core_hmac_sha1(key, data)
{
  var bkey = str2binb(key);
  if(bkey.length > 16) bkey = core_sha1(bkey, key.length * chrsz);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
  return core_sha1(opad.concat(hash), 512 + 160);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert an 8-bit or 16-bit string to an array of big-endian words
 * In 8-bit function, characters >255 have their hi-byte silently ignored.
 */
function str2binb(str)
{
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i%32);
  return bin;
}

/*
 * Convert an array of big-endian words to a string
 */
function binb2str(bin)
{
  var str = "";
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < bin.length * 32; i += chrsz)
    str += String.fromCharCode((bin[i>>5] >>> (32 - chrsz - i%32)) & mask);
  return str;
}

/*
 * Convert an array of big-endian words to a hex string.
 */
function binb2hex(binarray)
{
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i++)
  {
    str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
           hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
  }
  return str;
}

/*
 * Convert an array of big-endian words to a base-64 string
 */
function binb2b64(binarray)
{
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i += 3)
  {
    var triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16)
                | (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 )
                |  ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
    }
  }
  return str;
}

/* Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
 * Version: 1.0
 * LastModified: Dec 25 1999
 * This library is free.  You can redistribute it and/or modify it.
 */
 /* Modified by Chris Anderson to not use CommonJS */
 /* Modified by Dan Webb not to require Narwhal's binary library */

var Base64 = {};
(function(exports) {

  var encodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var decodeChars = [
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
      52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
      -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
      15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
      -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
      41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
  ];

  exports.encode = function (str) {
      var out, i, length;
      var c1, c2, c3;

      length = len(str);
      i = 0;
      out = [];
      while(i < length) {
          c1 = str.charCodeAt(i++) & 0xff;
          if(i == length)
          {
              out.push(encodeChars.charCodeAt(c1 >> 2));
              out.push(encodeChars.charCodeAt((c1 & 0x3) << 4));
              out.push("=".charCodeAt(0));
              out.push("=".charCodeAt(0));
              break;
          }
          c2 = str.charCodeAt(i++);
          if(i == length)
          {
              out.push(encodeChars.charCodeAt(c1 >> 2));
              out.push(encodeChars.charCodeAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4)));
              out.push(encodeChars.charCodeAt((c2 & 0xF) << 2));
              out.push("=".charCodeAt(0));
              break;
          }
          c3 = str.charCodeAt(i++);
          out.push(encodeChars.charCodeAt(c1 >> 2));
          out.push(encodeChars.charCodeAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4)));
          out.push(encodeChars.charCodeAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6)));
          out.push(encodeChars.charCodeAt(c3 & 0x3F));
      }

      var str = ""; 
      out.forEach(function(chr) { str += String.fromCharCode(chr) });
      return str;
  };

  exports.decode = function (str) {
      var c1, c2, c3, c4;
      var i, length, out;

      length = len(str);
      i = 0;
      out = [];
      while(i < length) {
          /* c1 */
          do {
              c1 = decodeChars[str.charCodeAt(i++) & 0xff];
          } while(i < length && c1 == -1);
          if(c1 == -1)
              break;

          /* c2 */
          do {
              c2 = decodeChars[str.charCodeAt(i++) & 0xff];
          } while(i < length && c2 == -1);
          if(c2 == -1)
              break;

          out.push(String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4)));

          /* c3 */
          do {
              c3 = str.charCodeAt(i++) & 0xff;
              if(c3 == 61)
                  return out.join('');
              c3 = decodeChars[c3];
          } while(i < length && c3 == -1);
          if(c3 == -1)
              break;

          out.push(String.fromCharCode(((c2 & 0xF) << 4) | ((c3 & 0x3C) >> 2)));

          /* c4 */
          do {
              c4 = str.charCodeAt(i++) & 0xff;
              if(c4 == 61)
                  return out.join('');
              c4 = decodeChars[c4];
          } while(i < length && c4 == -1);

          if(c4 == -1)
              break;

          out.push(String.fromCharCode(((c3 & 0x03) << 6) | c4));
      }

      return out.join('');
  };

  var len = function (object) {
      if (object.length !== undefined) {
          return object.length;
      } else if (object.getLength !== undefined) {
          return object.getLength();
      } else {
          return undefined;
      }
  };
})(Base64);


var class2type = [];
(function(o){
  var types = ["Boolean","Number","String","Function","Array","Date","RegExp","Object"];
  for (var i=0, length=types.length; i < length; i++) {
    var name = types[i];
    var key = "[object " + name + "]";
  	o[key] = name.toLowerCase();
  }
}(class2type));

var hasOwn = Object.prototype.hasOwnProperty,
  toString = Object.prototype.toString;

function type(obj) {
	return obj == null ? String(obj) : class2type[toString.call(obj)] || "object";
}

function isPlainObject(obj) {
	if ( !obj || type(obj) !== "object") {
		return false;
	}

	// Not own constructor property must be Object
	if ( obj.constructor &&
		!hasOwn.call(obj, "constructor") &&
		!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.

	var key;
	for (key in obj) {}

	return key === undefined || hasOwn.call( obj, key );
}

function isEmptyObject(obj) {
	for (var name in obj) {
		return false;
	}
	return true;
}

function isArray(obj) {
  return type(obj) === "array";
}

function isFunction(obj) {
  return type(obj) === "function";
}

function each(object, callback, args) {
	var name, i = 0,
		length = object.length,
		isObj = length === undefined || isFunction( object );

	if ( args ) {
		if ( isObj ) {
			for ( name in object ) {
				if ( callback.apply( object[ name ], args ) === false ) {
					break;
				}
			}
		} else {
			for ( ; i < length; ) {
				if ( callback.apply( object[ i++ ], args ) === false ) {
					break;
				}
			}
		}

	// A special, fast, case for the most common use of each
	} else {
		if ( isObj ) {
			for ( name in object ) {
				if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
					break;
				}
			}
		} else {
			for ( ; i < length; ) {
				if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
					break;
				}
			}
		}
	}

	return object;
}

function extend() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
			  if (options.hasOwnProperty(name)) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( isPlainObject(copy) || (copyIsArray = isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && isArray(src) ? src : [];

					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		  }
		}
	}

	// Return the modified object
	return target;
}

function inArray(elem, array) {
  if (Array.prototype.indexOf) {
    return array.indexOf(elem);
  }

  for (var i=0, length=array.length; i < length; i++) {
    if (array[i] === elem) {
      return i;
    }
  }

  return -1;
}  

