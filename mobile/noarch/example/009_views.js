require('ti-mocha');

var should = require('should');
var utils = require('test_utils');

module.exports = function() {
  var titouchdb = require('com.obscure.titouchdb'),
      manager = titouchdb.databaseManager;
      
  describe('view (general)', function() {
    var db, view;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      utils.install_elements_database(manager);
      db = manager.getExistingDatabase('elements');
      view = db.getView('test');
      view.setMapReduce(function(doc) {
        emit(doc._id, 1);
      },
      function(keys, values, rereduce) {
        var result = 0;
        for (i in values) {
          result += values[i];
        }
        return result;
      },
      '1');
    });
    
    it('must have a database property', function() {
      should(view).have.property('database', db);
    });
    
    it('must have a isStale property', function() {
      should(view).have.property('isStale');
      view.isStale.should.be.a.Boolean;
    });
    
    it('must have a lastSequenceIndexed property', function() {
      should(view).have.property('lastSequenceIndexed');
      view.lastSequenceIndexed.should.be.a.Number;
    });
    
    it('must have a map property', function() {
      should(view).have.property('map');
      should(view.map).be.a.Function;
    });
    
    it('must have a name property', function() {
      should(view).have.property('name', 'test');
    });
    
    it('must have a reduce property', function() {
      should(view).have.property('reduce');
      should(view.reduce).be.a.Function;
    });
    
    it('must have a createQuery method', function() {
      should(view.createQuery).be.a.Function;
    });
    
    it('must have a deleteView method', function() {
      should(view.deleteView).be.a.Function;
    });
    
    it('must have a deleteIndex method', function() {
      should(view.deleteIndex).be.a.Function;
    });
    
    it('must have a setMap method', function() {
      should(view.setMap).be.a.Function;
    });
    
    it('must have a setMapReduce method', function() {
      should(view.setMapReduce).be.a.Function;
    });
  });
  
  describe('view (lifecycle)', function() {
    var db;
    
    before(function() {
      db = manager.getDatabase('test008_viewlifecycle');
    });
    
    it('must create a view', function() {
      var view = db.getView('test1');
      view.setMap(function(doc) {
        emit(doc._id, null);
      }, '1');
      
      var viewreselect = db.getExistingView('test1');
      should.exist(viewreselect);
      view.name.should.eql(viewreselect.name);
    });
    
    it('must be stale if it has not been queried', function() {
      var view = db.getExistingView('test1');
      utils.create_test_documents(db, 4);
      view.isStale.should.be.true;
    });

    it('must delete a view', function() {
      db.getView('test1').deleteView();
      var v = db.getExistingView('test1');
      should.not.exist(v);
    });
    
  });
  
  describe('view (map only)', function() {
    var db, view;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      utils.install_elements_database(manager);
      db = manager.getExistingDatabase('elements');
      
      view = db.getView('noble_gases');
    });
    
    it('must set a map function', function() {
      var map = function(doc) {
        var noble_atnos = [2, 10, 18, 36, 54, 86];
        if (!!~noble_atnos.indexOf(doc.atomic_number)) {
          emit(doc.name, doc.atomic_number);
        }
      };
      view.setMap(map, '1');
      should(view.map).be.a.Function;
      should(view.map).be.exactly(map);
    });
    
    it('must return the correct number of rows from a query', function() {
      var q = view.createQuery();
      should.exist(q);
      
      var e = q.run();
      e.count.should.eql(6);
    });
    
    it('must return the correct keys and values from a query', function() {
      var e = view.createQuery().run();
      e.getRow(0).key.should.eql('Argon');
      e.getRow(0).value.should.eql(18);
      e.getRow(1).key.should.eql('Helium');
      e.getRow(1).value.should.eql(2);
      e.getRow(2).key.should.eql('Krypton');
      e.getRow(2).value.should.eql(36);
      e.getRow(3).key.should.eql('Neon');
      e.getRow(3).value.should.eql(10);
      e.getRow(4).key.should.eql('Radon');
      e.getRow(4).value.should.eql(86);
      e.getRow(5).key.should.eql('Xenon');
      e.getRow(5).value.should.eql(54);
    });
  });
  
  describe('view (map/reduce)', function() {
    var db, view;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      utils.install_elements_database(manager);
      db = manager.getExistingDatabase('elements');

      view = db.getView('noble_gases');
    });
    
    it('must set map and reduce', function() {
      var map = function(doc) {
        var noble_atnos = [2, 10, 18, 36, 54, 86];
        if (!!~noble_atnos.indexOf(doc.atomic_number)) {
          emit(doc.name, doc.atomic_number);
        }
      };
      var reduce = function(keys, values, rereduce) {
        var sum = 0;
        for (i in values) {
          sum += values[i];
        }
        return sum;
      };
      
      view.setMapReduce(map, reduce, '1');
      should(view.map).be.a.Function;
      should(view.map).be.exactly(map);
      should(view.reduce).be.a.Function;
      should(view.reduce).be.exactly(reduce);
    });
    
    it('must return the correct number of rows from a query', function() {
      var q = view.createQuery();
      should.exist(q);
      
      var e = q.run();
      e.count.should.eql(1);
    });
    
    it('must return the correct value from a query', function() {
      var e = view.createQuery().run();
      var r = e.getRow(0);
      r.value.should.eql(206);
      should.not.exist(r.key);
    });
    
    it('must support the built-in _count reduce function', function() {
      var v = db.getView('count');
      v.setMapReduce(function(doc) { emit(doc.atomic_number, null); }, '_count', '1');
      
      var q = v.createQuery();
      var e = q.run();
      e.count.should.eql(1);
      e.getRow(0).value.should.eql(118);
    });
    
    it('must support the built-in _sum reduce function', function() {
      var v = db.getView('sum');
      v.setMapReduce(function(doc) { emit(doc.atomic_number, doc.atomic_weight); }, '_sum', '1');
      
      var q = v.createQuery();
      var e = q.run();
      e.count.should.eql(1);
      e.getRow(0).value.should.be.approximately(17279.610692, 0.00001);
    });

    it('must support the built-in _stats reduce function', function() {
      var v = db.getView('sum');
      v.setMapReduce(function(doc) { emit(doc.atomic_number, doc.atomic_weight); }, '_stats', '1');
      
      var q = v.createQuery();
      var e = q.run();
      e.count.should.eql(1);
      
      var stats = e.getRow(0).value;
      stats.should.be.an.Object;
      stats.sum.should.be.approximately(17279.610692, 0.00001);
      stats.count.should.eql(118);
      stats.min.should.be.approximately(1.00794, 0.0001);
      stats.max.should.eql(294);
      // TODO sumsqr
      // stats.sumsqr.should.be.approximately(0, 0.1);
    });

  });
  
};
