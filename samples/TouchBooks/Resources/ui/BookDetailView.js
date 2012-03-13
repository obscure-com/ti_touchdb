var _ = require('/lib/underscore')._,
    dateFormatter = require('/lib/dateformat').dateFormatter;

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
  
  var result = Ti.UI.createTableView({
    uid: 1,
    style: Ti.UI.iPhone.TableViewStyle.GROUPED,
    in_edit_mode: false,
  });

  var rows = [];
  rows.push(createDetailRow(result, L('DetailRow__id'), doc.properties, '_id', null, (doc.docID && doc.docID.length > 0)));
  rows.push(createDetailRow(result, L('DetailRow_title'), doc.properties, 'title'));
  rows.push(createDetailRow(result, L('DetailRow_author'), doc.properties, 'author'));
  rows.push(createDetailRow(result, L('DetailRow_copyright'), doc.properties, 'copyright', dateFormatter));
  
  result.setData(rows);
  
  result.saveChanges = function() {
    var updated = {};
    _.each(rows, function(row) {
      updated[row.key] = row.value;
    });
    doc.properties = _.extend(doc.properties, updated);
    var status = db.putRevision(doc, doc.revID);
    return (status < 300);
  }
  
  result.addEventListener('books:change', function(e) {
    // still need to copy/modify/assign TiProxy dictionaries
    var book = doc.properties;
    book[e.key] = e.value;
    doc.properties = book;
  });
  
  return result;
};


var createDetailRow = function(tableView, label, book, key, formatter, immutable) {
  var result = Ti.UI.createTableViewRow({
    touchEnabled: false,
    key: key,
    value: book[key],
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
    text: formatter(result.value),
  });
  result.add(valueLabel);
  
  // set up modal window to edit values
  var EditorWindow = require('/ui/EditorWindow'),
      EditorView = require('/ui/EditorView');

  if (!immutable) {
    result.addEventListener('click', function(e) {
      if (tableView.in_edit_mode) {
        var editorWin = new EditorWindow(result, { title: label });
        var editorView = new EditorView(key, book[key]);
        editorWin.add(editorView);
        editorWin.open({
          modal: true,
          style: Ti.UI.iPhone.MODAL_TRANSITION_STYLE_COVER_VERTICAL,
          presentation: Ti.UI.iPhone.MODAL_PRESENTATION_PAGESHEET,
        });
      }
    });
  }      
  
  result.addEventListener('books:change', function(e) {
    result.value = e.value;
    valueLabel.text = formatter(result.value);
  });

  return result;
};

module.exports = BookDetailView;
