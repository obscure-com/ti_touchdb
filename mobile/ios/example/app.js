// open a single window
var window = Ti.UI.createWindow({
	backgroundColor:'white'
});
var label = Ti.UI.createLabel();
window.add(label);

window.addEventListener('open', function(e) {
    try {
        label.text = 'starting tests';
        require('test01_server').run_tests();    
        label.text = 'test01_server complete';
        require('test02_createdocument').run_tests();
        label.text = 'test02_createdocument complete';
    }
    catch (e) {
        label.text = e;
    }
});

window.open();


