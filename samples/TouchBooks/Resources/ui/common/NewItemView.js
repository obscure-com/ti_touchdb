var _ = require('lib/underscore'),
    books = require('lib/books'),
    forms = require('lib/appcelerator/forms');

var fields = [
  { title: 'ISBN', type: 'text', id: 'isbn' },
  { title: 'Title', type: 'text', id: 'title' },
  { title: 'Author', type: 'text', id: 'author' },
  { title: 'Copyright', type: 'date', id: 'copyright' },
  { title: 'Save', type:'submit', id:'saveChanges' }
];

function NewItemView() {
  var self = Ti.UI.createView();

  var form = forms.createForm({
    style: forms.STYLE_LABEL,
    fields: fields
  });
  form.addEventListener('saveChanges', function(e) {
    var isbn = form.fieldRefs.isbn.value;
    if (!isbn) {
      alert(L('NewItemView_isbn_required'));
    }
    
    var props = {
      title: form.fieldRefs.title.value,
      author: form.fieldRefs.author.value
    };
    
    var dt = (form.fieldRefs.copyright.value || '').split('/');
    props.copyright = [parseInt(dt[2], 10) || 1970, parseInt(dt[0], 10) || 1, parseInt(dt[1], 10) || 1];
      
    books.saveBook(isbn, props, function(err, result) {
      if (!err) {
        Ti.App.fireEvent('books:book_created');
      }
      else {
        alert(err.error.description);
      }
    });
  });
  self.add(form);

  return self;
}

module.exports = NewItemView;
