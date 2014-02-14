require('ti-mocha');

var should = require('should');
var utils = require('test_utils');

module.exports = function() {
  var titouchdb = require('com.obscure.titouchdb'),
      manager = titouchdb.databaseManager;
      
  describe('database validation', function() {
    var db;
    
    var dummy_fn = function() {};
    
    before(function() {
      db = manager.getDatabase('test005_validation');
      db.setValidation('require_tag', function(rev, context) {
        if (rev.properties.tag == null) {
          context.reject();
        }
      });
    });
    
    it('must store validation functions by name', function() {
      db.setValidation('temp', dummy_fn);
    });
    
    it('must return stored validation functions', function() {
      var fn = db.getValidation('temp');
      should.exist(fn);
      should(fn).eql(dummy_fn);
    });
    
    it('must remove validations when set to null', function() {
      db.setValidation('temp', null);
      var fn = db.getValidation('temp');
      should.not.exist(fn);
    });
    
    it('must not add a document that fails validation', function() {
      var doc = db.createDocument();
      var rev = doc.putProperties({ name: 'no tag' });
      should.not.exist(rev);
      should(doc.error).be.an.Object;
      db.documentCount.should.eql(0);
    });
    
    it('must add a document that passes validation', function() {
      var doc = db.createDocument();
      var rev = doc.putProperties({ name: 'with tag', tag: 1 });
      should.exist(rev);
      rev.revisionID.should.be.ok;
      db.documentCount.should.eql(1);
    });
    
    it('must allow updating a rejected doc', function() {
      var doc = db.createDocument();
      var rev = doc.putProperties({ name: 'no tag' });
      should.not.exist(rev);
      rev = doc.putProperties({ name: 'fixed tag', tag: 2 });
      should.exist(rev);
      rev.revisionID.should.be.ok;
    });
    
    it('must allow validation functions that call other functions', function() {
      var is_int = function(n, v) {
        return n != null && v != null && !isNaN(parseInt(v));
      }
      
      db.setValidation('tag_must_be_int', function(rev, context) {
        if (!is_int('tag', rev.properties.tag)) {
          context.reject();
        }
      });
      
      var doc = db.createDocument();
      var rev = doc.putProperties({ name: 'string tag', tag: 'foo' });
      should.not.exist(rev);
      rev = doc.putProperties({ name: 'int tag', tag: 12 });
      should.exist(rev);
      
      db.setValidation('tag_must_be_int', null);
    });
    
    it('must support calling rejectWithMessage', function() {
      db.setValidation('with_message', function(rev, context) {
        if (rev.properties.foogle == null) {
          context.rejectWithMessage('you need a foogle, fool!');
        }
      });
      
      var doc = db.createDocument();
      var rev = doc.putProperties({ name: 'baddoc' });
      should.not.exist(rev);
      should(doc.error).be.an.Object;
      // not yet working
      // doc.error.description.should.be('forbidden: you need a foogle, fool!');
    });
  });
};
