
var BookDetailView = function(db, e) {
  var doc;
  if (e.isbn) {
    doc = db.getDocument(e.isbn);
  }
  else {
    doc = db.createRevision({
      title: L('book_default_title'),
      author: L('book_default_author'),
      copyright: [1970],
    });
  }
  
  var rows = [];
  rows.push(createDetailRow(L('DetailRow__id'), doc.properties, '_id'));
  rows.push(createDetailRow(L('DetailRow_title'), doc.properties, 'title'));
  rows.push(createDetailRow(L('DetailRow_author'), doc.properties, 'author'));
  rows.push(createDetailRow(L('DetailRow_copyright'), doc.properties, 'copyright', dateFormatter));
  
  var result = Ti.UI.createTableView({
    data: rows,
    style: Ti.UI.iPhone.TableViewStyle.GROUPED,
  });

  // TODO event listeners
  
  return result;
};

var _ = require('/lib/underscore')._,
    dateFormatter = require('/lib/dateformat').dateFormatter;

var createDetailRow = function(label, book, key, formatter) {
  var result = Ti.UI.createTableViewRow({
    touchEnabled: false,
    // _value: book[key],
  });
  
  formatter = (formatter || function(v) { return v; }),

  result.add(Ti.UI.createLabel({
    top: 4,
    bottom: 6,
    left: 4,
    width: 80,
    color: '#6070A0',
    font: { fontSize: 12 },
    text: label,
    textAlign: 'right',
  }));

  var valueLabel = Ti.UI.createLabel({
    top: 4,
    left: 90, 
    bottom: 4,
    width: 190,
    color: 'black',
    font: { fontSize: 14, fontWeight: 'bold' },
    text: formatter(book[key]),
  });
  result.add(valueLabel);
  
  result.label = function() {
    return label;
  }
  
  /*
  result._current_value = function() {
    return this._value;
  };
  
  result._set_current_value = function(v) {
    this._value = v;
    valueLabel.text = formatter(v);
    parentWin.fireEvent('book:change', {
      key: key,
      value: this._value,
    });
  };
    
  result.addEventListener('click', function(e) {
    // not sure why we are receiving events if touchEnabled == false...
    if (result.touchEnabled) {
      var editor = exports.createEditorWindow(result);
      editor.open({
        modal: true,
        style: Ti.UI.iPhone.MODAL_TRANSITION_STYLE_COVER_VERTICAL,
        presentation: Ti.UI.iPhone.MODAL_PRESENTATION_PAGESHEET,
      });
    }
  });
  */
  
  return result;
};

module.exports = BookDetailView;
