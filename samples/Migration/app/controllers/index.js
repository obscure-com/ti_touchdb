
function window_open(e) {
  Alloy.Collections.contact.fetch();
}

function transform(model) {
  var result = model.toJSON();
  result.full_name = String.format("%s, %s", result.last, result.first);
  Ti.API.info(JSON.stringify(result));
  return result;
}

$.index.open();
