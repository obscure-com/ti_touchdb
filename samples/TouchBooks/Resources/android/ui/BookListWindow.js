
var BookListWindow = function(tableView) {
  var _ = require('lib/underscore');
  
  var result = Ti.UI.createWindow({
    title: L('RootWindow_title'),
    backgroundColor: 'black'
  });
  
  result.add(tableView);
  
  /*
  var editButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.EDIT,
  });
  editButton.addEventListener('click', function(e) {
    result.tableView.editing = true;
    result.leftNavButton = doneButton;
  });
  
  var doneButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.DONE,
  });
  doneButton.addEventListener('click', function(e) {
    result.tableView.editing = false;
    result.leftNavButton = editButton;
  });
  
  result.leftNavButton = editButton;
  
  var addButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.ADD,
  });
  addButton.addEventListener('click', function(e) {
    Ti.App.fireEvent('books:show_detail_view');
  });
  result.rightNavButton = addButton;
  */
 
  result.refresh = function() {
    tableView.fireEvent('refresh');
  }

  result.addEventListener('open', function(e) {
    result.refresh();
  });

  // maybe move to view?
  Ti.App.addEventListener('books:refresh_all', function(e) {
    result.refresh();
  });
  
  result.addEventListener('focus', function(e) {
    result.refresh();
  });

  return result;
}



module.exports = BookListWindow;
