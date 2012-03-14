
var BookListWindow = function() {
  var _ = require('/lib/underscore');
  
  var result = Ti.UI.createWindow({
    title: L('RootWindow_title')
  });
  
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

  result.addEventListener('open', function(e) {
    result.tableView = _.find(result.children, function(child) {
      return child.uid === 1;
    });
    result.tableView.fireEvent('refresh');
  });

  // maybe move to view?
  Ti.App.addEventListener('books:refresh_all', function(e) {
    result.tableView.fireEvent('refresh');
  });
  
  result.addEventListener('focus', function(e) {
    result.tableView.fireEvent('refresh');
  });
  
  return result;
}



module.exports = BookListWindow;
