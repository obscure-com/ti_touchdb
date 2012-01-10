
var _ = require('lib/underscore')._;

function array_to_date(a) {
  var d = new Date(0);
  d.setFullYear(a.shift() || 0);
  d.setMonth((a.shift() || 1) - 1);
  d.setDate(a.shift() || 1);
  return d;
};

function date_to_array(d) {
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
}

var dateFormatter = function(v) {
  var d;
  if (_.isArray(v)) {
    d = array_to_date(v);
  }
  else if (_.isDate(v)) {
    d = v;
  }
  else if (_.isNumber(v)) {
    d = new Date(v * 1000);
  }
  return d ? String.formatDate(d, 'medium') : v;
}

exports.createRootWindow = function(controller, db, options) {
  var result = Ti.UI.createWindow({
    title: L('RootWindow.title'),
    backgroundColor: 'white',
  });
  _.extend(result, options);

  var tableView = Ti.UI.createTableView({
    
  });
  result.addEventListener('click', function(e) {
    var book = e.rowData.book;
    controller.open(exports.createDetailWindow(controller, db, book));
  });
  result.addEventListener('delete', function(e) {
    var book = e.rowData.book;
    if (book) {
      db.remove(book._id, book._rev, function(resp, status) {
        if (status !== 200) {
          alert('Error deleting book: '+JSON.stringify(resp));
        }
      });
    }
  });
  result.add(tableView);

  var editButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.EDIT,
  });
  editButton.addEventListener('click', function(e) {
    tableView.editing = true;
    result.leftNavButton = doneButton;
  });
  
  var doneButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.DONE,
  });
  doneButton.addEventListener('click', function(e) {
    tableView.editing = false;
    result.leftNavButton = editButton;
  });
  
  result.leftNavButton = editButton;
  
  var addButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.ADD,
  });
  addButton.addEventListener('click', function(e) {
    var win = exports.createDetailWindow(controller, db, {
      title: L('book.default_title'),
      author: L('book.default_author'),
      copyright: [1970],
    });
    win._set_editing(true);
    controller.open(win);
  });
  result.rightNavButton = addButton;

  result.addEventListener('open', function(e) {
    load_book_list(db, tableView);
  });
    
  return result;
};

function load_book_list(db, table) {
  db.view('books/by_author', { include_docs: true }, function(data, status) {
    var sections = [];
    if (status === 200) {
      var section;
      for (i in data.rows) {
        var author = data.rows[i].key[0];
        var book = data.rows[i].doc;
        
        if (!section || section.headerTitle !== author) {
          section && sections.push(section);
          section = Ti.UI.createTableViewSection({
            headerTitle: author
          });
        }
        
        section.add(Ti.UI.createTableViewRow({
          id: 'BookListRow',
          title: book.title,
          hasChild: true,
          book: book,
        }));
      }
    }
    table.setData(sections);
  });
};

exports.createDetailWindow = function(controller, db, book) {
  var result = Ti.UI.createWindow({
    title: L('DetailWindow.title'),
    backgroundColor: 'white',
  });

  // create a copy of the original book for editing  
  var newbook = {};
  _.extend(newbook, book);
  
  // _.extend is a shallow copy, so manually duplicate the copyright array
  newbook.copyright = book.copyright.slice(0);

  result.addEventListener('book:change', function(e) {
    if (e.key && e.value) {
      newbook[e.key] = e.value;
    }
  });
  
  var rows = [];
  rows.push(createDetailRow(result, L('DetailRow._id'), book, '_id'));
  rows.push(createDetailRow(result, L('DetailRow.title'), book, 'title'));
  rows.push(createDetailRow(result, L('DetailRow.author'), book, 'author'));
  rows.push(createDetailRow(result, L('DetailRow.copyright'), book, 'copyright', dateFormatter));
  
  var tableView = Ti.UI.createTableView({
    data: rows,
    style: Ti.UI.iPhone.TableViewStyle.GROUPED,
  });
  result.add(tableView);


  var editButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.EDIT,
  });
  editButton.addEventListener('click', function(e) {
    result._set_editing(true);
  });
  
  var doneButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.DONE,
  });
  doneButton.addEventListener('click', function(e) {
    result._set_editing(false);
    if (!newbook._id || newbook._id.length < 1) {
      alert(L('DetailWindow.error.missing_id'));
      return;
    }
    
    if (book._id && newbook._id !== book._id) {
      var alertDialog = Ti.UI.createAlertDialog({
        message: L('DetailWindow.warning.changed_id'),
        buttonNames: [L('Ok'), L('Cancel')]
      });
      alertDialog.addEventListener('click', function(e) {
        if (e.index === 0) {
          /*
           * If the _id field changed, you need to remove the revision or there
           * will be a document update error if you ever try to save the doc again.
           */
          delete newbook._rev;
          saveBook(db, newbook);
          controller.pop();
        }
      });
      alertDialog.show();
    }
    else {
      saveBook(db, newbook);
      controller.pop();
    }
    
  });
  
  result.rightNavButton = editButton;
  
  result._set_editing = function(editing) {
    for (var i in rows) {
      rows[i].hasChild = editing;
      rows[i].touchEnabled = editing;
    }
    result.rightNavButton = editing ? doneButton : editButton;
  }

  return result;
};


function saveBook(db, book) {
  Ti.API.info("saving: "+JSON.stringify(book));
  
  /*
   * ensure that the book has a title and an author, or it won't be
   * displayed in the book list
   */
  book.title = book.title || L('book.default_title')
  book.author = book.author || L('book.default_author')
  
  db.save(book._id, book, function(resp, status) {
    if (status !== 201) {
      alert('Error updating book: '+JSON.stringify(resp));
    }
  });
};

function createDetailRow(parentWin, label, book, key, formatter) {
  var result = Ti.UI.createTableViewRow({
    touchEnabled: false,
    _value: book[key],
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
  
  return result;
};


exports.createEditorWindow = function(tableRow) {
  var result = Ti.UI.createWindow({
    title: tableRow.label(),
    backgroundColor: 'stripped',
  });
  
  var current = tableRow._current_value();
  var savefn;
  
  if (_.isArray(current)) {
    var pickerVal = array_to_date(current);

    var picker = Ti.UI.createPicker({
      top: 12,
      type: Titanium.UI.PICKER_TYPE_DATE,
      value: pickerVal,
    });
    
    /*
     * picker.value doesn't seem to work, so listen for changes
     */
    picker.addEventListener('change', function(e) {
      pickerVal = e.value;
    });
    result.add(picker);
    
    savefn = function(e) {
      tableRow._set_current_value(date_to_array(pickerVal));
      result.close();
    }
  }
  else {
    var textField = Ti.UI.createTextField({
      top: 12,
      left: 10,
      right: 10,
      height: 35,
      font: { fontSize: 14 },
      borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
      value: tableRow._current_value(),
    });
    result.add(textField);
    
    savefn = function(e) {
      tableRow._set_current_value(textField.value);
      result.close();
    }
  }
  

  var cancelButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.CANCEL,
  });
  cancelButton.addEventListener('click', function(e) {
    result.close();
  });
  result.leftNavButton = cancelButton;
  
  var saveButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.SAVE,
  });
  saveButton.addEventListener('click', savefn);
  result.rightNavButton = saveButton;
  
  
  result.addEventListener('open', function(e) {
    textField && textField.focus();
  });
  
  return result;
};

