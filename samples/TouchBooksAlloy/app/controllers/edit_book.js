
var book = Alloy.createModel('Book');
book.on('fetch', function(obj) {
  $.isbn.text = book.id;
  $.title.value = book.get('title');
  $.author.value = book.get('author');

  var published = book.get('published') || [];
  var publishedDate = new Date(
    published.length > 0 ? published[0] : 1970,
    (published.length > 1 ? published[1] : 1) - 1,
    published.length > 2 ? published[2] : 1);
  $.published.value = publishedDate;
});

exports.set_book_id = function(id) {
  book.id = id;
  book.fetch();
};
