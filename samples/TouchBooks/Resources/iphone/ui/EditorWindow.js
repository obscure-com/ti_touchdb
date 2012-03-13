
var EditorWindow = function(tableRow) {
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

module.exports = EditorWindow;
