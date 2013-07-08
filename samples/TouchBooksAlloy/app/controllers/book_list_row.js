var book = arguments && arguments[0] || {};

$.title.text = book.get('title');

var att = book.attachmentNamed('cover.png');
var cover = att ? att.body : '/images/text_page.png';
$.cover.image = cover;

$.tableViewRow.addEventListener('click', function(e) {
  Ti.App.fireEvent('books:edit_book', {
	  book_id: book.id
  });
});
