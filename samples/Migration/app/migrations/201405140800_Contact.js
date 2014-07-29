// http://www.generatedata.com
var preload_data = [
  { "last": "Hall", "first": "Xena", "street": "5444 Cras Rd.", "city": "Carapicuíba", "state": "São Paulo" },
  { "last": "Grant", "first": "Macaulay", "street": "462 Curae; Av.", "city": "Racine", "state": "WI" },
  { "last": "Perez", "first": "Orlando", "street": "P.O. Box 588", "city": "Ellesmere", "state": "OH" },
  { "last": "Tucker", "first": "Wayne", "street": "386-1375 Lorem Ave", "city": "Fresno", "state": "CA" },
  { "last": "Owen", "first": "Fuller", "street": "889 Nulla Ave", "city": "Lincoln", "state": "NB" },
  { "last": "Jimenez", "first": "Blair", "street": "4732 Turpis. St.", "city": "Campbelltown", "state": "GA" },
  { "last": "Maxwell", "first": "Ashton", "street": "118 Pellentesque Av. Apt 4", "city": "Knoxville", "state": "TN" },
  { "last": "Glover", "first": "Candice", "street": "7281 Integer Rd.", "city": "Vienna", "state": "TX" },
  { "last": "Pace", "first": "Joan", "street": "3455 Sodales Rd.", "city": "Bellary", "state": "KY" },
  { "last": "Carney", "first": "Lacota", "street": "5413 Elementum Avenue", "city": "Whitehorse", "state": "YT" }
];

migration.up = function(migrator) {
  var db = migrator.database;
  _.each(preload_data, function(contact) {
    migrator.createModel(contact);
  });
};

migration.down = function(migrator) {
  
};
