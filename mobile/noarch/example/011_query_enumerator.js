require('ti-mocha');

var should = require('should');
var utils = require('test_utils');

module.exports = function() {
  var titouchdb = require('com.obscure.titouchdb'),
      manager = titouchdb.databaseManager;


  describe('query enumerator (API)', function() {
    var db, view, e;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test011');
      view = db.getView('test');
      view.setMap(function(doc) { emit(doc.id, null); }, '1');
      e = view.createQuery().run();
    });

    it('must have a count property', function() {
      should(e).have.property('count');
      e.count.should.be.a.Number;
    });
    
    it('must have a sequenceNumber property', function() {
      should(e).have.property('sequenceNumber');
      e.sequenceNumber.should.be.a.Number;
    });
    
    it('must have a stale property', function() {
      should(e).have.property('stale');
      e.stale.should.be.a.Boolean;
    });
    
    it('must have a getRow function', function() {
      should(e.getRow).be.a.Function;
    });
    
    it('must have a next function', function() {
      should(e.next).be.a.Function;
    });
    
    it('must have a reset function', function() {
      should(e.reset).be.a.Function;
    });
    
  });
  
  describe('query enumerator (functional)', function() {
    var db, view;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test011_a');
      utils.create_test_documents(db, 10);
      view = db.getView('silly');
      view.setMap(function(doc) { if (doc.sequence % 2 == 0) emit(doc.sequence, null); }, '1');
    });
    
    it('must return the correct count of rows', function() {
      var e = view.createQuery().run();
      e.count.should.eql(5);
    });
    
    it('must return the correct sequence number', function() {
      var e = view.createQuery().run();
      e.sequenceNumber.should.eql(10);
    });
    
    it('must return the correct value for stale', function() {
      var e = view.createQuery().run();
      e.stale.should.eql(false);
      
      var doc = db.createDocument();
      doc.putProperties({ sequence: 10, testName: 'someTest' });

      e.stale.should.eql(true);
    });
    
    it('must return a row by index', function() {
      var e = view.createQuery().run();
      var row = e.getRow(3);
      should.exist(row);
      should(row.key).eql(6);
      
      var missing = e.getRow(20);
      should.not.exist(missing);
    });
    
    it('must return a row from next()', function() {
      var e = view.createQuery().run();
      for (var i=0; i <= 10; i += 2) {
        var row = e.next();
        should.exist(row);
        row.key.should.eql(i);
      }
      var missing = e.next();
      should.not.exist(missing);
    });
    
    it('must reset the cursor position', function() {
      var e = view.createQuery().run();
      var r1 = e.next();
      r1.key.should.eql(0);
      var r2 = e.next();
      r2.key.should.eql(2);
      e.reset();
      var r3 = e.next();
      r3.key.should.eql(0);
    });
  });
};