var _ = require('underscore');

exports.Connection = function(url) {
  var self = {};

  self.database = function(name) {
    var self = {};
    
    self.create = function() {
      return http_client({
        method: 'PUT',
        url: [url, name].join('/')
      });
    },

    self.exists = function() {
      return http_client({
        url: [url, name].join('/')
      });
    },
    
    self.destroy = function() {
      return http_client({
        method: 'DELETE',
        url: [url, name].join('/'),
      })
    },
    
    self.get = function(docid) {
      return http_client({
        url: [url, name, docid].join('/'),
      });
    },
    
    self.save = function() {
      if (arguments.length < 1) return;
      
      var docid, data = arguments.pop();
      if (arguments.length > 1) {
        doc._rev = arguments.pop() || data._rev;
      }
      docid = arguments.pop() || data._id;
      
      if (docid) {
        http_client({
          method: 'PUT',
          url: [url, name, docid].join('/'),
          data: data,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      else {
        http_client({
          method: 'POST',
          url: [url, name].join('/'),
          data: data,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
    }
    
    /*
    self.create = function(cb) {
      http_req('PUT', [url, name].join('/'), null, cb, null)
    }
    
    self.exists = function(cb) {
      http_req('GET', [url, name].join('/'), null, cb, null)
    };
    
    self.destroy = function(cb) {
      http_req('DELETE', [url, name].join('/'), null, cb, null)
    };
    
    self.get = function(docid, cb) {
      http_req('GET', [url, name, docid].join('/'), null, cb, null);
    };

    self.save = function() {
      if (arguments.length < 1) return;
      
      var docid, data = arguments.pop();
      if (arguments.length > 1) {
        doc._rev = arguments.pop() || data._rev;
      }
      docid = arguments.pop() || data._id;
      
      if (docid) {
        http_req('PUT', [url, name, docid].join('/'), data, cb, 'application/json')
      }
      else {
        http_req('POST', [url, name].join('/'), data, cb, 'application/json');
      }
    };
    */
    
    return self;
  };
  
  return self;
};

// ajax functions

function convertResponseBody(xhr) {
  var mimeType = xhr.getResponseHeader('Content-Type');
  if (/^application\/json/.test(mimeType) || /^text\/javascript/.test(mimeType)) {
    return JSON.parse(xhr.responseText);
  }
  else if (/^application\/xml/.test(mimeType) || /^text\/xml/.test(mimeType)) {
    return xhr.responseXML;
  }
  // TODO image, audio video return blob?
  else {
    return xhr.responseText;
  }
}

function toQueryString(obj) {
  if (!obj) return undefined;
  
  var a = [];
  _.each(obj, function(i, key) {
    if (_.has(obj, key)) {
      a.push([Ti.Network.encodeURIComponent(key), Ti.Network.encodeURIComponent(obj[key])].join('='));
    }
  });
  return a.join('&');
}


// promise-based version of Ti.Network.HttpClient, adapted from
// https://gist.github.com/3099268
var Q = require('q');
function http_client(options) {
  var deferred = Q.defer(),
      req = Ti.Network.createHTTPClient({
        onload: function(e) {
          deferred.resolve(convertResponseBody(this))
        },
        onerror: function(e) {
          deferred.reject({ status: this.status, error: this.responseBody || this.statusText });
        }
      });
  
  var url = options.url;
  if (options.data && (options.method || 'GET') === 'GET') {
    url += '?' + toQueryString(data);
  }
  
  req.open(options.method || 'GET', url);
  
  Object.keys(options.headers || {}).forEach(function(key) {
    req.setRequestHeader(key, options.headers[key]);
  });
  
  req.send(options.data || void 0);
  
  return deferred.promise;
}


function http_req(method, url, data, cb, contentType) {
  var self = this;
  
  if (data && method === 'GET') {
    url += '?' + toQueryString(data);
  }
  
  var req = Ti.Network.createHTTPClient({
    onload: function(e) {
      var body = convertResponseBody(this);
      if (body && body.error) {
        cb && cb.call(body, null);
      }
      else {
        cb && cb.call(self, null, { body: body, status: this.status });
      }
    },
    onerror: function(e) {
      cb && cb.call(self, { status: this.status, error: this.responseBody || this.statusText }, null);
    }
  });
  req.open(method, url);
  if (contentType) {
    req.setRequestHeader('Content-Type', contentType);
  }
  Ti.API.info(method + ' '+url);
  if (data) Ti.API.info(JSON.stringify(data));
  
  req.send(data);
}