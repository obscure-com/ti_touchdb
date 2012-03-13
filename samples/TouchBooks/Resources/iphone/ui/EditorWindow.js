var _ = require('/lib/underscore')._;

var EditorWindow = function(changeEventTarget, opts) {
  var result = Ti.UI.createWindow({
    title: opts.title,
    backgroundColor: 'stripped',
  });
  
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
  saveButton.addEventListener('click', function(e) {
    if (changeEventTarget) {
      var view = _.find(result.children, function(child) {
        return child.uid === 1;
      });
      var key = view ? view.key : undefined;
      var value = view ? view.value : undefined;
      if (key && value) {
        changeEventTarget.fireEvent('books:change', {
          key: key,
          value: value,
        });
      }      
    }
    result.close();
  });
  result.rightNavButton = saveButton;
  
  return result;  
};

module.exports = EditorWindow;
