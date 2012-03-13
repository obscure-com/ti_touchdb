var _ = require('/lib/underscore')._,
    dateformat = require('/lib/dateformat');

var EditorView = function(key, value) {
  var result = Ti.UI.createView({
    uid: 1,
    key: key,
    value: value,
    backgroundColor: 'transparent'
  });
  
  if (_.isArray(value)) {
    var pickerVal = dateformat.array_to_date(value);

    var picker = Ti.UI.createPicker({
      top: 12,
      type: Titanium.UI.PICKER_TYPE_DATE,
      value: pickerVal,
    });
    
    /*
     * picker.value doesn't seem to work, so listen for changes
     */
    picker.addEventListener('change', function(e) {
      result.value = e.value;
    });
    
    result.add(picker);
  }
  else {
    var textField = Ti.UI.createTextField({
      top: 12,
      left: 10,
      right: 10,
      height: 35,
      font: { fontSize: 14 },
      borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
      value: value,
    });
    
    textField.addEventListener('change', function(e) {
      result.value = e.value;
    });

    result.add(textField);
  }
  
  return result;
};

module.exports = EditorView;
