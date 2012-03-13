var _ = require('/lib/underscore')._;

var BookDetailWindow = function(e) {
  Ti.API.info(JSON.stringify(e));
  var result = Ti.UI.createWindow({
    title: e.title
  });
  
  var doneButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.DONE,
  });
  doneButton.addEventListener('click', function(e) {
    /*
    result._set_editing(false);
    if (!newbook._id || newbook._id.length < 1) {
      alert(L('DetailWindow.error.missing_id'));
      return;
    }
    
    if (book._id && newbook._id !== book._id) {
      var alertDialog = Ti.UI.createAlertDialog({
        message: L('DetailWindow.warning.changed_id'),
        buttonNames: [L('Ok'), L('Cancel')]
      });
      alertDialog.addEventListener('click', function(e) {
        if (e.index === 0) {
          delete newbook._rev;
          saveBook(db, newbook);
          controller.pop();
        }
      });
      alertDialog.show();
    }
    else {
      saveBook(db, newbook);
      controller.pop();
    }
    */
  });

  var editButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.EDIT,
  });
  editButton.addEventListener('click', function(e) {
    result.rightNavButton = doneButton;
    // result._set_editing(true);
  });
  
  result.rightNavButton = editButton;
  
  result.addEventListener('open', function(e) {
    result.tableView = _.find(result.children, function(child) {
      return child.appendRow !== undefined;
    });
  });
  
  return result;
};

module.exports = BookDetailWindow;
