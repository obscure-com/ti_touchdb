Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.titouchdb');

exports.run_tests = function() {
  var mgr = server.databaseManager;
  try {
    var err = server.startListener();
    assert(!err, "error starting listener: "+JSON.stringify(err));
    
    var client = Ti.Network.createHTTPClient({
      onload: function(e) {
        Ti.API.info("internalURL returned: "+this.responseText);
        server.stopListener();
      },
      onerror: function(e) {
        server.stopListener();
        throw new Error(e.error);
      },
      timeout: 5000
    });
    Ti.API.info("connecting to "+mgr.internalURL);
    client.open("GET", "http://localhost:5984/");
    client.send();
  }
  catch (e) {
    throw e;
  }
}