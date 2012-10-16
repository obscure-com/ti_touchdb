
var book = Alloy.createModel('Book');

book.on('fetch', function(obj) {
  $.isbn.text = book.id;
  $.title.value = book.get('title');
  $.author.value = book.get('author');

  var published = book.get('published') || [1970];
  var publishedDate = new Date();
  publishedDate.setFullYear(published.length > 0 ? published[0] : 1970);
  publishedDate.setMonth(published.length > 1 ? published[1] - 1 : 0);
  publishedDate.setDate(published.length > 2 ? published[2] : 1);
  $.published.value = publishedDate;
});

book.on('update', function() {
  Ti.App.fireEvent('books:book_changed', { book_id: book.id });
});

exports.set_book_id = function(id) {
  book.id = id;
  book.fetch();
};

function saveChanges(e) {
  book.set('title', $.title.value);
  book.set('author', $.author.value);
  book.set('published', [$.published.value.getFullYear(), $.published.value.getMonth() + 1, $.published.value.getDate()]);
  book.save();
}
