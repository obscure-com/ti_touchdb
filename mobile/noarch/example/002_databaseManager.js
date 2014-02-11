require('ti-mocha');

var should = require('should');
var utils = require('test_utils');

module.exports = function() {
  var titouchdb = require('com.obscure.titouchdb'),
      manager = titouchdb.databaseManager;
  
  describe('database manager', function() {

    before(function() {
      utils.delete_nonsystem_databases(manager);
    });

    it('must exist', function() {
      should.exist(manager);
      should(manager).have.property('error', null);
    });
    
    it('must provide the default db directory', function() {
      should(manager).have.property('defaultDirectory');
      manager.defaultDirectory.should.be.ok;
    });
    
    it('must provide the current db directory', function() {
      should(manager).have.property('directory');
      manager.directory.should.be.ok;
      var dir = Ti.Filesystem.getFile(manager.directory);
      dir.exists().should.be.ok;
      dir.isDirectory().should.be.ok;
      dir.writable.should.be.ok;
    });
    
    it('must validate database names', function() {
      should(manager.isValidDatabaseName).be.a.Function;
      manager.isValidDatabaseName('abc123').should.be.true;
      manager.isValidDatabaseName('a').should.be.true;
      manager.isValidDatabaseName('_a').should.be.false;
      manager.isValidDatabaseName('a_').should.be.true;
      manager.isValidDatabaseName('%20foobar').should.be.false;
      manager.isValidDatabaseName('001').should.be.false;
      manager.isValidDatabaseName('FOO').should.be.false;
    });
    
    it('must provide all database names', function() {
      should(manager).have.property('allDatabaseNames');
      manager.allDatabaseNames.should.be.an.Array;
      manager.allDatabaseNames.should.have.a.lengthOf(1);
    });
    
    it('must have a close method', function() {
      should(manager.close).be.a.Function;
      // TODO actually close?
    });
    
    it('must create a database given a new name', function() {
      should(manager.getDatabase).be.a.Function;
      var db = manager.getDatabase('test002_1');
      should.exist(db);
      should(manager).have.property('error', null);
    });
    
    it('must not return a database with a new name', function() {
      should(manager.getExistingDatabase).be.a.Function;
      var db = manager.getExistingDatabase('test_does_not_exist');
      should.not.exist(db);
      should(manager.error).be.an.Object
    });
    
    it('must return a previously created database', function() {
      var db = manager.getExistingDatabase('test002_1');
      should.exist(db);
      should(manager.error).eql(null);
    });
    
    it('must return the same db instance each time', function() {
      var db1 = manager.getDatabase('test002_2');
      var db2 = manager.getDatabase('test002_2');
      if (db1 !== db2) {
        throw new Error('did not return the same database instance');
      }
    });
    
    if (Ti.Platform.osname === 'iphone' || Ti.Platform.osname === 'ipad') {
      it('must install a prebuilt db', function() {
        var basedir = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'assets', 'CouchbaseLite').path;
        var dbfile = [basedir, 'elements.touchdb'].join(Ti.Filesystem.separator);
        var attdir = [basedir, 'elements attachments'].join(Ti.Filesystem.separator);
        var installresult = manager.replaceDatabase('elements', dbfile, attdir);
        installresult.should.be.ok;
        
        var eldb = manager.getExistingDatabase('elements');
        should.exist(eldb);
        
        var doc = eldb.getDocument('1AD71A0D-3213-4059-9D91-8C4A70DD9183');
        should.exist(doc);
        doc.documentID.should.eql('1AD71A0D-3213-4059-9D91-8C4A70DD9183');
        
        var att = doc.currentRevision.getAttachment('image.jpg');
        should.exist(att);
      });
      
      it('must fail on bad database install paths', function() {
        var installresult = manager.replaceDatabase('failure', '/foo/bar/baz', '/bing/bang/boom');
        installresult.should.not.be.ok;
        should(manager.error).should.be.an.Object;
      });
    }
  });
};
