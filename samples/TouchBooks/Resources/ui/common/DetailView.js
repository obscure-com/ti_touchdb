var _ = require('lib/underscore'),
    books = require('lib/books'),
    forms = require('lib/appcelerator/forms');

var fields = [
  { title: 'Title', type: 'text', id: 'title' },
  { title: 'Author', type: 'text', id: 'author' },
  { title: 'Copyright', type: 'date', id: 'copyright' },
  { title: 'Save', type:'submit', id:'saveChanges' }
];

function DetailView() {
  var self = Ti.UI.createView();

  var form = forms.createForm({
    style: forms.STYLE_LABEL,
    fields: fields
  });
  form.addEventListener('saveChanges', function(e) {
    if (self.isbn) {
      var props = {
        title: form.fieldRefs.title.value,
        author: form.fieldRefs.author.value
      };
      var dt = form.fieldRefs.copyright.value.split('/');
      props.copyright = [parseInt(dt[2], 10) || 1970, parseInt(dt[0], 10) || 1, parseInt(dt[1], 10) || 1];
        
      books.saveBook(self.isbn, props, function(err, result) {
        if (!err) {
          Ti.App.fireEvent('books:book_updated');
        }
        else {
          alert(err.error.description);
        }
      });
    }
  });
  self.add(form);

  self.refresh = function(isbn) {
    /*
     * Don't be afraid to fetch documents from the database.  You might think,
     * "I've already got the document as part of my view result, so why should
     * I go get it again?"  Fetching by document ID is not only very fast in
     * TouchDB, it also helps decouple your UI objects from the data source.
     * Because this view only needs a document ID as input, it can be used
     * not only to display a document that came from the master view, but also
     * to show a search result or an ID that was a field of another documents
     * like a book collection.  Reloading is ok!
     */
    books.fetchBook(isbn, function(err, doc) {
      self.isbn = isbn;

      var props = doc.properties;
      form.fieldRefs.title.value = props.title;
      form.fieldRefs.author.value = props.author;
      if (props.copyright) {
        // in the db, copyright is [year, month, day], so we need to rearrange
        // it a bit for the form module.
        form.fieldRefs.copyright.value = [props.copyright[2] || 1, props.copyright[1] || 1, props.copyright[0] || 1970].join('/');
      }      
    });
  };

  self.addEventListener('itemSelected', function(e) {
    self.refresh(e.isbn);
  });
  
  return self;
}

module.exports = DetailView;
