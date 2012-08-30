var _ = require('lib/underscore');

var repl;

exports.launch = function() {
  var TiTouchDB = require('com.obscure.titouchdb'),
      AppNavigationGroup = require('/ui/AppNavigationGroup');

  // get the database object and ensure that it is open
  var db = TiTouchDB.databaseNamed('books');
  db.ensureCreated();
  
  // start with one replication at the beginning
  _.once(function() {
    repl = db.pullFromDatabaseAtURL('http://touchbooks.iriscouch.com/books');
    repl.addEventListener('stopped', function(e) {
      Ti.App.fireEvent('books:refresh_all');
    });
    repl.start();
  })();

  var win = Ti.UI.createWindow();
  
  var nav = new AppNavigationGroup(db);
  win.add(nav);
  win.open();
};
