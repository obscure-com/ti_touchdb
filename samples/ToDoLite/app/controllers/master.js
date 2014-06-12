
function createListWithTitle(title) {
  var list = Alloy.createModel('List');
  // TODO if there is a userID set, add it to the list
  list.save({ title: title }, {
    error: function(e) {
      Ti.UI.createAlertDialog({
        title: "Error",
        message: "Cannot create a new list.",
      }).show();
    }
  });
}

// event handlers

function doLogin(e) {
  alert("TODO");
}

function insertNewObject(e) {
  // TODO use androidView property for Android
  var dialog = Ti.UI.createAlertDialog({
    title: "New To-Do List",
    message: "Title for new list:",
    style: Ti.UI.iPhone.AlertDialogStyle.PLAIN_TEXT_INPUT,
    buttonNames: ['Create', 'Cancel'],
    cancel: 1,
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
  alert("selected row "+e.itemId);
}

function windowOpen(e) {
  Alloy.Collections.instance('list').fetch();
}

function windowClose(e) {
  $.destroy();
}
