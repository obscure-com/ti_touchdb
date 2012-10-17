
var book = Alloy.createModel('Book');

book.on('fetch', function(obj) {
  $.isbn.value = book.id;
  $.title.value = book.get('title');
  $.author.value = book.get('author');

  var published = book.get('published') || [];
  var publishedDate = new Date();
  publishedDate.setFullYear(published.length > 0 ? published[0] : 1970);
  publishedDate.setMonth(published.length > 1 ? published[1] - 1 : 0);
  publishedDate.setDate(published.length > 2 ? published[2] : 1);
  $.published.value = publishedDate;
});

book.on('update', function() {
  Ti.App.fireEvent('books:book_changed', { book_id: book.id });
  alert(String.format('updated "%s"', book.get('title')));
});

exports.set_book_id = function(id) {
  book.id = id;
  $.isbn.touchEnabled = false;
  $.isbn.borderStyle = Ti.UI.INPUT_BORDERSTYLE_NONE;

  book.fetch();
};

function changePublished(e) {
  book.set('published', [e.value.getFullYear(), e.value.getMonth() + 1, e.value.getDate()]);
}

function saveChanges(e) {
  book.id = $.isbn.value;
  book.set('title', $.title.value);
  book.set('author', $.author.value);
  book.save();
}
