var _ = require('/lib/underscore')._;

var array_to_date = function(a) {
  var d = new Date(0);
  d.setFullYear(a.shift() || 0);
  d.setMonth((a.shift() || 1) - 1);
  d.setDate(a.shift() || 1);
  return d;
};

var date_to_array = function(d) {
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
};

exports.dateFormatter = dateFormatter;
exports.array_to_date = array_to_date;
exports.date_to_array = date_to_array;