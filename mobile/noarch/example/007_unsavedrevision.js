require('ti-mocha');

var should = require('should');
var utils = require('test_utils');

module.exports = function() {
  var titouchdb = require('com.obscure.titouchdb'),
      manager = titouchdb.databaseManager;

  describe('unsaved revision (general)', function() {
    var db, doc, rev;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test007_unsavedrevgeneral');
      doc = db.getDocument();
      doc.putProperties({ name: 'unsaved rev', x: 15, foo: false });
      rev = doc.createRevision();
    });
    
    it('must have an isDeletion property', function() {
      should(rev).have.property('isDeletion', false);
    });
    
    it('must have a properties property', function() {
      should(rev).have.property('properties');
      should(rev.properties).have.properties(['_id', '_rev', 'name', 'x', 'foo']);
    });

    it('must have a userProperties property', function() {
      should(rev).have.property('userProperties');
      should(rev.userProperties).have.properties(['name', 'x', 'foo']);
      should(rev.userProperties).not.have.properties(['_id', '_rev']);
    });
    
    it('must have a removeAttachment method', function() {
      should(rev.removeAttachment).be.a.Function;
    });
    
    it('must have a save method', function() {
      should(rev.save).be.a.Function;
    });
    
    it('must have a setAttachment method', function() {
      should(rev.setAttachment).be.a.Function;
    });
    
  });
  
  describe('unsaved revision (deletion)', function() {
    var db, doc;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test007_unsavedrevdeletion');
      doc = db.getDocument();
      doc.putProperties({ name: 'doomed document' });
    });
    
    it('must be able to delete by setting isDeletion', function() {
      var rev = doc.createRevision();
      rev.isDeletion = true;
      rev.save();
      doc.currentRevision.isDeletion.should.be.true;
      doc.revisionHistory.length.should.eql(2);
      doc.revisionHistory[1].isDeletion.should.be.true;
    });
  });

  describe('unsaved revision (properties)', function() {
    var db, doc;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test007_unsavedrevprops');
      doc = db.getDocument();
    });
    
    it('must be able to set properties', function() {
      var rev = doc.createRevision();
      rev.properties = {
        status: 'ok',
        post_id: 619,
        slug: 'great-images-in-nasa',
        url: 'http:\/\/data.nasa.gov\/great-images-in-nasa\/',
        title: 'Great Images in NASA',
        date: '2011-09-19 06:26:13',
        modified: '2011-09-19 06:26:13'
      };
      rev.save();
      
      doc.currentRevision.properties.should.have.properties(['_id', '_rev', 'status', 'post_id', 'slug', 'url', 'title', 'date', 'modified']);
    });

    it('must be able to set userProperties', function() {
      var rev = doc.createRevision();
      rev.userProperties = {
      	color: "red",
      	value: "#f00"
      };
      rev.save();
      
      doc.currentRevision.properties.should.have.properties(['color', 'value']);
    });
  });

  describe('unsaved revision (save)', function() {
    var db;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test007_unsavedrevprops');
    });
    
    it('must allow conflicts for save(true)', function() {
      var doc = db.getDocument();
      var rev1 = doc.putProperties({ name: "Paul", birth_year: 1977 });
      
      var rev2a = rev1.createRevision();
      rev2a.setPropertyForKey('married', true);
      rev2a = rev2a.save(true);
      should.exist(rev2a);
      
      var rev2b = rev1.createRevision();
      rev2b.setPropertyForKey('birth_year', 1967);
      rev2b = rev2b.save(true); 
      should.exist(rev2b);
    });
    
    it('must prevent conflicts for save(false)', function() {
      var doc = db.getDocument();
      var rev1 = doc.putProperties({ name: "Paul", birth_year: 1977 });
      
      var rev2a = rev1.createRevision();
      rev2a.setPropertyForKey('married', true);
      rev2a = rev2a.save(false);
      should.exist(rev2a);
      
      var rev2b = rev1.createRevision();
      rev2b.setPropertyForKey('birth_year', 1967);
      rev2b = rev2b.save(false); 
      should.not.exist(rev2b);
    });
  });
  
  describe('unsaved revision (attachments)', function() {
    var db;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test007_unsavedrevattachments');
    });
    
    it('must add an attachment from a blob', function() {
      var doc = db.getDocument('doc-with-attachment');
      var rev = doc.createRevision();
      var f = Ti.Filesystem.getFile('assets/serenity.jpg');
      
      rev.setAttachment('serenity.jpg', 'image/jpeg', f.read());
      rev.save();
      should(doc.error).not.be.an.Object;
      
      doc.currentRevision.attachmentNames.length.should.eql(1);
      doc.currentRevision.attachments.length.should.eql(1);
      var att = doc.currentRevision.getAttachment('serenity.jpg');
      should(att).be.an.Object;
    });

    it.skip('must add an attachment from a file URL', function() {
      var doc = db.getDocument();
      var rev = doc.createRevision();
      
      rev.setAttachment('animal.jpg', 'image/jpeg', 'file:///modules/com.obscure.titouchdb/1.0-beta/example/assets/serenity.jpg');
      rev.save();
      should(doc.error).not.be.an.Object;
      
      doc.currentRevision.attachmentNames.length.should.eql(1);
      doc.currentRevision.attachments.length.should.eql(1);
      var att = doc.currentRevision.getAttachment('animal.jpg');
      should(att).be.an.Object;
    });

    it('must remove an attachment', function() {
      var doc = db.getDocument('doc-with-attachment');
      var rev = doc.createRevision();
      rev.removeAttachment('serenity.jpg');
      rev.save();
      should(doc.error).not.be.an.Object;
    
      doc.currentRevision.attachmentNames.length.should.eql(0);
      doc.currentRevision.attachments.length.should.eql(0);
      should(doc.currentRevision.getAttachment('serenity.jpg')).be.type('undefined');
    });
    
    it('must add inline attachments', function() {
      var doc = db.getDocument();
      var rev = doc.createRevision();
      rev.properties = inline;
      rev.save();
      should(doc.error).not.be.an.Object;

      doc.currentRevision.attachmentNames.length.should.eql(1);
      doc.currentRevision.attachments.length.should.eql(1);
      var att = doc.currentRevision.getAttachment('turnsign.png');
      should(att).be.an.Object;
    });
    
    // TODO inline attachments
  });
};

var inline = {
  "_attachments" :     {
    "turnsign.png" :         {
      "content_type" : "image/png",
      data : "iVBORw0KGgoAAAANSUhEUgAAADoAAABHCAMAAABh2aQFAAADAFBMVEUFBwYFBwYDBQQDBQQEBgUGCAcJCgkKDAsLDQwMDg0NDg0OEA8REhEUFRQVFxYWGBcXGRgcHR0nKCcqKysrLCstLi0wMTA1NjU6Ozs8PT1AQkFKS0pRUlJUVVVXWFhaW1tdXl1hYmFmZ2dvcG92d3d8fXx/gH+Cg4KEhYSGhoaNjY2VlpaZmpqampqcnJyfn5+ioqKkpaSoqKisrKyvr6+ysrKzs7O0tLS1tbW3t7e4ubm4ubm6u7q7vLy9vb29vr6/wMDFxcXIyMjJycnJycnLy8vMzMzMzMzNzc3T09PY2Nna2tvb29zd3d3d3d3e3t/j4+Pk5OXl5eXl5eXm5ubp6ens7Ozt7e3v7+/z8/P19fX39/f5+fn6+vr7+/v8/Pz9/f39/f3+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9z3DJaAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAHGlUWHRTb2Z0d2FyZQAAAAAAUGFpbnQuTkVUIHYzLjM2yrDfJAAAA2hJREFUWIXt121TokAAB/C9BdEwLkULQy0f4Dq1UTS7HqxLnXMUzkmb8oE0GIdvuJ/wFihPPWyW5l72H8ZlgB/LLiyLYDHsttp+07l/ujfAsD/Ruj7TGUx65Z9AHUn8V785qE4eFKC2wuJ3n5H5xAidgf7PYAn5TTr2gH5gGjr1T+OfFGfeb9x/hBq/q1meSz76pYZWzcQYSEH+ty86H9Ry2EEaAEZ+IabWC3b7LKSAHTr59I7coLocC0OKBq7cO39PblCjGHIrdCgr5usPC9K26jka/LWQZgW5Z5BRNBAhWA31hZdUi4iiVowC65iOlXQiihSOXrcAhrJe9/dfOpODm5amxQ4JReO0c8lMgKKW56CEFglFqoC7ikqU8wfsss9gQiWh6CpKAZicWEMlubzPVHpEQs0iS2NqX3wp/mrpYMEgoEjPB2Byaq8teqm3aqO/SCh6zMZLprs6PAq82uyMhKLZdDnehim3o+lIi4iuRj1w20tJa08k0WutzDr1QmGtk4noxB0TNHftm6Ky21Ow6J9qvNNamJv7pnrKuWLKvde+KMq7VBj7pydOY6nEB2jhk37SDboTwmHED1Ct7qTpf+R45v9Sa+E9n/49YAudXeUzUgu/6PuFMn7vTouVZ9T81sN7BoWSPSH0TqqGJzWKXCBMRxWEGl+5Oj6eOxyjE1jGu0biTg2fOvul6F1rK8p9q+eD+xpq7NlzxwpFSghvaEWEgSc1JSjN0TQNSphSrLJGp0n2zMwxb9/rG3Qi7jbt8zNpTKPc4WiVojp71IwePnnTIR/TcNHmxNkNl8oxp2tUP+LEcHnLzRlE4jbVIsL4hjtq80Jzb4Xa7RdHW+hjjFeXtaZnMpNbrRU9HzMK2kJxW+9wUQ1lUINLm9o+S4krdCHvNrZRQ4KygfQMXbTpCyoGIClFzche4U4K4ct26DDh0vx5vX4+ep/OC2HIwqhioevdFJ7YT4HTVjvBK7SQdq63UjSrZdP5G/yUanIFf02Mv5ee0Y1kR9aQdSlr2ymyZrozoC3T+RS28O/CdGLZa9YmvQ1+YLw6fwe19q6Q8ZnjKH46LkB7XBBi+/4SFy/H+hm47E/rFaWiKBWFvKi11X4J3CoDtdPt4KX7T9Htem7Gizqo3gGzU61dXHnkeq1Yz+VZtWP+AT+LLVmIy5KQAAAAAElFTkSuQmCC",
    }
  }
};