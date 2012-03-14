
exports.launch = function() {
  var TiTouchDB = require('com.obscure.TiTouchDB'),
      AppNavigationGroup = require('/ui/AppNavigationGroup');

  // get the database object and ensure that it is open
  var db = TiTouchDB.databaseNamed('books');
  db.open();
  
  // start with one replication at the beginning
  TiTouchDB.addEventListener('TDReplicatorProgressChanged', function(e) {
    Ti.App.fireEvent('books:refresh_all');
  });
  db.replicateDatabase('http://touchbooks.iriscouch.com/books', false);

  var win = Ti.UI.createWindow();
  
  win.addEventListener('close', function(e) {
    db.close();
  });
  
  var nav = new AppNavigationGroup(db);
  win.add(nav);
  win.open();
};
