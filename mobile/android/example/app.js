// open a single window
var window = Ti.UI.createWindow({
	backgroundColor:'white'
});
var label = Ti.UI.createLabel();
window.add(label);

window.addEventListener('open', function(e) {
  Ti.API.info("starting tests");
    try {
        label.text = 'starting tests';
        require('test01_server').run_tests();    
        label.text = 'test01_server complete';
        require('test02_createdocument').run_tests();
        label.text = 'test02_createdocument complete';
        require('test02_createrevisions').run_tests();
        label.text = 'test02_createrevisions complete';
        require('test03_savemultipledocuments').run_tests();
        label.text = 'test03_savemultipledocuments complete';
        require('test03_savemultipleunsaveddocuments').run_tests();
        label.text = 'test03_savemultipleunsaveddocuments complete';
        require('test03_deletemultipledocuments').run_tests();
        label.text = 'test03_deletemultipledocuments complete';
        require('test04_deletedocument').run_tests();
        label.text = 'test04_deletedocument complete';
        require('test05_alldocuments').run_tests();
        label.text = 'test05_alldocuments complete';
        require('test07_history').run_tests();
        label.text = 'test07_history complete';
        require('test08_attachments').run_tests();
        label.text = 'test08_attachments complete';
        /*
        require('test12_createview').run_tests();
        label.text = 'test12_createview complete';
        require('test13_runview').run_tests();
        label.text = 'test13_runview complete';
        require('test13_validation').run_tests();
        label.text = 'test13_validation complete';
        require('test14_runslowview').run_tests();
        label.text = 'test14_runslowview complete';
        require('test14_viewwithlinkeddocs').run_tests();
        label.text = 'test14_viewwithlinkeddocs complete';
        require('test15_uncacheviews').run_tests();
        label.text = 'test15_uncacheviews complete';
        require('test16_viewoptions').run_tests();
        label.text = 'test16_viewoptions complete';
        require('test17_replication').run_tests();
        label.text = 'test17_replication complete';
        */
        label.text = "all tests passed! whoopee!"
    }
    catch (e) {
        label.text = e;
    }
});

window.open();


