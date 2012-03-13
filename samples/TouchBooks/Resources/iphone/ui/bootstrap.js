
exports.launch = function() {
  var TiTouchDB = require('com.obscure.TiTouchDB'),
      AppNavigationGroup = require('/ui/AppNavigationGroup');

  var win = Ti.UI.createWindow();
  var nav = new AppNavigationGroup(TiTouchDB);
  win.add(nav);
  win.open();
};
