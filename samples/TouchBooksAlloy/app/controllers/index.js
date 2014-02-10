Ti.App.addEventListener('books:edit_book', function(e) {
  var editBookController = Alloy.createController("edit_book");
  if (e.book_id) {
    editBookController.set_book_id(e.book_id);
  }
  
  if (OS_IOS) {
    $.nav.openWindow(editBookController.getView());
  }
  else if (OS_ANDROID) {
    editBookController.getView().open();
  }
});

$.nav.open();
