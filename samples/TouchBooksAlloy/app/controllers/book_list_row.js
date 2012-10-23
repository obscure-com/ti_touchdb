var book = arguments && arguments[0] || {};

$.title.text = book.get('title');
// TODO book attachment to cover view

$.tableViewRow.addEventListener('click', function(e) {
  Ti.App.fireEvent('books:edit_book', {
	  book_id: book._id
  });
});
