// http://www.generatedata.com
var preload_data = [
  { "first": "Xaviera", "last": "Stafford", "street": "449 Lobortis St.", "city": "Missoula", "state": "MT" },
  { "first": "Alexander", "last": "Strickland", "street": "2851 Consequat Av.", "city": "Fuenlabrada", "state": "MA" },
  { "first": "Oren", "last": "Fletcher", "street": "Ap #192-4259 Velit Avenue", "city": "Kraków", "state": "MP" },
  { "first": "Rachel", "last": "Fowler", "street": "6764 Sit Rd.", "city": "Raymond", "state": "AB" },
  { "first": "Yoko", "last": "Stewart", "street": "62022 Ornare Road", "city": "Providence", "state": "RI" },
  { "first": "Brent", "last": "Winters", "street": "6075 Donec St.", "city": "Atwater", "state": "CA" }
];

migration.up = function(migrator) {
  var db = migrator.database;
  _.each(preload_data, function(contact) {
    migrator.createModel(contact);
  });
};

migration.down = function(migrator) {
  Ti.API.info("down");
  var db = migrator.database;
  var q = db.createSlowQuery(function(doc) {
    emit([doc.last, doc.first], null);
  });
  var e = q.run();
  while (row = e.next()) {
    var key = row.key;
    if (_.find(preload_data, function(contact) {
      return contact.last === key[0] && contact.first === key[1];
    })) {
      row.getDocument().deleteDocument();
    }
  }
  
};

