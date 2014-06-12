var args = arguments[0] || {};

// event handlers

function windowOpen(e) {
  $.tasks.fetch({ startKey: [args.list_id], endKey: [args.list_id, {}] });
}

function windowClose(e) {
  $.destroy();
}

function shareButtonAction(e) {
  alert('TODO share');
}

function addImageButtonAction(e) {
  alert('TODO add image');
}

function textFieldShouldReturn(e) {
  alert("TODO add task");
}
