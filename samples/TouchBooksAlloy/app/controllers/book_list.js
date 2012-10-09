
var books = Alloy.createCollection("Book");
books.on('fetch', function(e) {
  $.tableView.refresh(books);
});

$.tableView.refresh = function(collection) {
  var data = [];
  collection.each(function(book) {
    var row = Ti.UI.createTableViewRow({
      title: book.get('title')
    });
    data.push(row);
  });
  this.setData(data);
};

function loadBookList(e) {
  books.fetch();
}

function changeGrouping(e) {
  if (OS_ANDROID) {
    if (e.source.id === 'authorSwitch') {
      $.publishedSwitch.value = !e.source.value;
    }
    else if (e.source.id === 'publishedSwitch') {
      $.authorSwitch.value = !e.source.value;
    }
  }
}
