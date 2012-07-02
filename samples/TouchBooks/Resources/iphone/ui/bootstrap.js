
exports.launch = function() {
  var TiTouchDB = require('com.obscure.TiTouchDB'),
      AppNavigationGroup = require('/ui/AppNavigationGroup');

  // get the database object and ensure that it is open
  var db = TiTouchDB.databaseNamed('books');
  db.ensureCreated();
  
  // start with one replication at the beginning
  var repl = db.pullFromDatabaseAtURL('http://touchbooks.iriscouch.com/books');
  repl.addEventListener('progress', function(e) {
    Ti.API.info("progress!");
  });
  repl.start();

  var win = Ti.UI.createWindow();
  
  var nav = new AppNavigationGroup(db);
  win.add(nav);
  win.open();
};
