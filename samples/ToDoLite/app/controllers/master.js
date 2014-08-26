var lists = Alloy.Collections.list;

function createListWithTitle(title) {
  var list = Alloy.createModel('List');
  // TODO if there is a userID set, add it to the list
  list.save({ title: title }, {
    success: function() {
      lists.fetch();
    },
    error: function(e) {
      Ti.UI.createAlertDialog({
        title: "Error",
        message: "Cannot create a new list.",
      }).show();
    }
  });
}

// event handlers

function insertNewObject(e) {
  // TODO use androidView property for Android
  var dialog = Ti.UI.createAlertDialog({
    title: "New To-Do List",
    message: "Title for new list:",
    style: Ti.UI.iPhone.AlertDialogStyle.PLAIN_TEXT_INPUT,
    buttonNames: ['Cancel', 'Create'],
    cancel: 0,
  });
  dialog.addEventListener('click', function(e) {
    if (e.index !== e.source.cancel) {
      if (e.text && e.text.length > 0) {
        createListWithTitle(e.text);
      }
    }
  });
  dialog.show();
}

function didSelectRow(e) {
  Ti.App.fireEvent('list:select', { list_id: e.itemId });
}

function didDelete(e) {
  var doomed = lists.get(e.itemId);
  doomed.deleteList();
  lists.fetch();
}

function windowOpen(e) {
  if (!Alloy.Globals.cblSync.userID) {
    var loginButton = Ti.UI.createButton({
      title: "Login",
    });
    loginButton.addEventListener('click', function() {
      Alloy.Globals.loginAndSync(function() {
        $.master.leftNavButton = null;
      });
    });
    $.master.leftNavButton = loginButton;
  }
  Ti.App.addEventListener('sync:change', syncChanged);
  lists.fetch();
}

function windowClose(e) {
  Ti.App.removeEventListener('sync:change', syncChanged);
  $.destroy();
}

function syncChanged(e) {
  lists.fetch();
}
