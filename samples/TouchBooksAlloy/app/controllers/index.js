if (OS_IOS) {
  $.main.open();
}
else if (OS_ANDROID) {
  $.main.getView().open();
}

Ti.App.addEventListener('books:edit_book', function(e) {
  var editBookController = Alloy.createController("edit_book");
  editBookController.set_book_id(e.book_id);
  if (OS_IOS) {
    $.nav.open(editBookController.getView());
  }
  else if (OS_ANDROID) {
    editBookController.getView().open();
  }
});

