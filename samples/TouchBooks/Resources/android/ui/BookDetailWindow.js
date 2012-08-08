var _ = require('/lib/underscore')._;

var BookDetailWindow = function(e) {

  var activity = {
    onCreateOptionsMenu: function(e) {
      var menu = e.menu;
      
      var editItem = menu.add({ title: L('DetailWindow_menu_edit')}); 
      editItem.addEventListener('click', function(e) {
        alert('TODO edit');
      });

      var deleteItem = menu.add({ title: L('DetailWindow_menu_delete')}); 
      deleteItem.addEventListener('click', function(e) {
        alert('TODO delete');
      });
    }
  };
  
  var result = Ti.UI.createWindow({
    title: e.title,
    navBarHidden: false, // heavyweight window
    backgroundColor: 'white',
    activity: activity,
  });

/*  
  var doneButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.DONE,
  });
  doneButton.addEventListener('click', function(e) {
    result.tableView.in_edit_mode = false;
    result.rightNavButton = editButton;
    if (!result.tableView.saveChanges()) {
      alert(L('book_save_error'));
    }
  });

  var editButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.EDIT,
  });
  editButton.addEventListener('click', function(e) {
    result.tableView.in_edit_mode = true;
    result.rightNavButton = doneButton;
  });

  result.rightNavButton = editButton;
*/
  
  result.addEventListener('open', function(e) {
    result.tableView = _.find(result.children, function(child) {
      return child.uid === 1;
    });
    
    // event listener to change the window title
    result.tableView.addEventListener('books:change', function(e) {
      if (e.key === 'title') {
        result.title = e.value;
      }
    });
  });
  
  return result;
};

module.exports = BookDetailWindow;
