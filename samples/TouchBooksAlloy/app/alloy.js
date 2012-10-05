/*
 * App initialization logic; runs prior to UI load
 */

var server = require('com.obscure.titouchdb'),
    db = server.databaseNamed(Alloy.CFG.books_db_name);

db.ensureCreated();

// TODO load schema

