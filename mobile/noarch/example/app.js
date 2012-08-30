// open a single window
var window = Ti.UI.createWindow({
  layout: 'vertical',
	backgroundColor:'white'
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
        testname.text = 'test01_server';
        require('test01_server').run_tests();    
        testname.text = 'test02_createdocument';
        require('test02_createdocument').run_tests();
        testname.text = 'test02_createrevisions';
        require('test02_createrevisions').run_tests();
        testname.text = 'test03_savemultipledocuments';
        require('test03_savemultipledocuments').run_tests();
        testname.text = 'test03_savemultipleunsaveddocuments';
        require('test03_savemultipleunsaveddocuments').run_tests();
        testname.text = 'test03_deletemultipledocuments';
        require('test03_deletemultipledocuments').run_tests();
        testname.text = 'test04_deletedocument';
        require('test04_deletedocument').run_tests();
        testname.text = 'test05_alldocuments';
        require('test05_alldocuments').run_tests();
        testname.text = 'test05_updatefromalldocs';
        require('test05_updatefromalldocs').run_tests();
        testname.text = 'test07_history';
        require('test07_history').run_tests();
        testname.text = 'test08_attachments';
        require('test08_attachments').run_tests();
        testname.text = 'test12_createview';
        require('test12_createview').run_tests();
        testname.text = 'test13_runview';
        require('test13_runview').run_tests();
        testname.text = 'test13_viewreduce';
        require('test13_viewreduce').run_tests();
        testname.text = 'test13_viewcomplexkeys';
        require('test13_viewcomplexkeys').run_tests();
        testname.text = 'test13_validation';
        require('test13_validation').run_tests();
        testname.text = 'test13_viewupdate';
        require('test13_viewupdate').run_tests();
        testname.text = 'test14_runslowview';
        require('test14_runslowview').run_tests();
        testname.text = 'test14_viewwithlinkeddocs';
        require('test14_viewwithlinkeddocs').run_tests();
        testname.text = 'test15_uncacheviews';
        require('test15_uncacheviews').run_tests();
        testname.text = 'test16_viewoptions';
        require('test16_viewoptions').run_tests();
        testname.text = 'test17_replication';
        require('test17_replication').run_tests();
        testname.text = "all tests passed! whoopee!";
    }
    catch (e) {
        status.text = e;
    }
});

window.open();


