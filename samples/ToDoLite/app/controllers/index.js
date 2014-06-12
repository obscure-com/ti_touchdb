
Ti.App.addEventListener('list:select', function(e) {
  var controller = Alloy.createController('detail', e);
  $.index.openWindow(controller.getView());
});

$.index.open();
