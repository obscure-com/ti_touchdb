// open a single window
var window = Ti.UI.createWindow({
  layout: 'vertical',
  backgroundColor: 'white'
});

var testname = Ti.UI.createLabel();
window.add(testname);

var status = Ti.UI.createLabel();
window.add(status);

var imageView = Ti.UI.createImageView();
window.add(imageView);

window.addEventListener('open', function() {
  Ti.API.info("starting tests");
  try {
    testname.text = '001_module';
    require('001_module').run_tests();
    testname.text = '002_databaseManager';
    require('002_databaseManager').run_tests();
    testname.text = '003_database';
    require('003_database').run_tests();
    testname.text = '004_database_query';
    require('004_database_query').run_tests();
    testname.text = '005_database_validation';
    require('005_database_validation').run_tests();
    testname.text = '006_document';
    require('006_document').run_tests();
    testname.text = '007_revisions';
    require('007_revisions').run_tests();
    testname.text = '008_attachments';
    require('008_attachments').run_tests();
    testname.text = '009_views';
    require('009_views').run_tests();
    testname.text = '010_change_tracking';
    require('010_change_tracking').run_tests();
    testname.text = '011_update_in_query';
    require('011_update_in_query').run_tests();
    testname.text = '012_history';
    require('012_history').run_tests();
    testname.text = '013_view_linked_docs';
    require('013_view_linked_docs').run_tests();
    testname.text = "all tests passed! whoopee!";
  }
  catch (e) {
    status.text = e;
  }
});

window.open();
