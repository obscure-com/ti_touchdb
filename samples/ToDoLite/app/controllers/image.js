var args = arguments[0] || {};

function windowOpen(e) {
  var task = Alloy.createModel('task');
  task.fetch({
    id: args.task_id,
    success: function() {
      var att = task.attachmentNamed('image.jpg');
      if (att) {
        $.imageView.image = att.content;
      }
      else {
        // TODO close, error?
      }
    }
  });
}

function dismissWindow(e) {
  $.win.close();
}
