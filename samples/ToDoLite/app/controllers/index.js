
Ti.App.addEventListener('list:select', function(e) {
  var controller = Alloy.createController('detail', e);
  $.index.openWindow(controller.getView());
});

Ti.App.addEventListener('list:share', function(e) {
  var controller = Alloy.createController('share', e);
  $.index.openWindow(controller.getView());
});

$.index.open();
