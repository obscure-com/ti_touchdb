require('ti-mocha');

// import tests
require('001_module')();
require('002_databaseManager')();
require('003_database')();
require('004_all_documents_query')();
require('005_database_validation')();
require('006_document')();
require('007_revisions')();
require('007_savedrevision')();
require('007_unsavedrevision')();
require('008_attachments')();
require('009_views')();
require('010_queries')();
require('011_query_enumerator')();
require('012_query_row')();
require('013_replication')();

// create a window and run the tests
var window = Ti.UI.createWindow({
  layout: 'vertical',
  backgroundColor: 'white'
});

window.addEventListener('open', function() {
  mocha.run();
})

window.open();
