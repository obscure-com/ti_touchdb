require('ti-mocha');

var should = require('should');
var utils = require('test_utils');

module.exports = function() {
  var titouchdb = require('com.obscure.titouchdb'),
      manager = titouchdb.databaseManager;

  describe('filtered replication (push)', function() {
    var conf, repl, db;
    
    before(function(done) {
      this.timeout(10000);
      
      utils.delete_nonsystem_databases(manager);
      db = utils.install_elements_database(manager);
      conf = utils.verify_couchdb_server(done);
    });
    
    it('must push with a filter', function(done) {
      this.timeout(10000);
      
      var target_url = 'http://'+conf.host+':'+conf.port+'/noble_gases';
      
      db.setFilter('noble_gases', function(doc, req) {
        return [2, 10, 18, 36, 54, 86].indexOf(doc.atomic_number) != -1;
      });
      
      repl = db.createPushReplication(target_url);
      repl.filter = 'noble_gases';
      repl.createTarget = true;
      
      var hasStopped = false;
      repl.addEventListener('change', function(e) {
        if (!hasStopped && e.source.status == titouchdb.REPLICATION_MODE_STOPPED) {
          hasStopped = true;
          should.not.exist(repl.lastError);
          repl.isRunning.should.eql(false);
          
          var client = Ti.Network.createHTTPClient({
            onload: function(e) {
              var resp = JSON.parse(this.responseText);
              should.exist(resp);
              should.exist(resp.doc_count);
              resp.doc_count.should.eql(6);
              done();
            },
            onerror: function(e) {
              throw e;
            }
          });
          client.open("GET", target_url);
          client.send();
        }
      });
      repl.start();
    });
    
  });
  
};