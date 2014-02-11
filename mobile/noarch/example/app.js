require('ti-mocha');

// import tests
require('001_module')();
require('002_databaseManager')();
require('003_database')();

// create a window and run the tests
var window = Ti.UI.createWindow({
  layout: 'vertical',
  backgroundColor: 'white'
});

window.addEventListener('open', function() {
  mocha.run();
})

window.open();
