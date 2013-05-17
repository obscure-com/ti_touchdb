Ti.include('test_utils.js')

var _ = require('underscore'),
    touchdb = require('com.obscure.titouchdb');

exports.run_tests = function() {
  assert(touchdb, "missing module");
  
  var mgr = touchdb.databaseManager;
  assert(mgr, 'missing databaseManager');
}