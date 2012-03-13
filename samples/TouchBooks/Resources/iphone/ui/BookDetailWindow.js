var _ = require('/lib/underscore')._;

var BookDetailWindow = function(e) {
  var result = Ti.UI.createWindow({
    title: e.title
  });
  
  var doneButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.DONE,
  });
  doneButton.addEventListener('click', function(e) {
   // TODO validate and save
   result.tableView.in_edit_mode = false;
   result.tableView.saveChanges();
   result.rightNavButton = editButton;
  });

  var editButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.EDIT,
  });
  editButton.addEventListener('click', function(e) {
    result.tableView.in_edit_mode = true;
    result.rightNavButton = doneButton;
  });
  
  result.rightNavButton = editButton;
  
  result.addEventListener('open', function(e) {
    result.tableView = _.find(result.children, function(child) {
      return child.uid === 1;
    });
  });
  
  return result;
};

module.exports = BookDetailWindow;
