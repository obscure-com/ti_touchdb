// open a single window
var window = Ti.UI.createWindow({
	backgroundColor:'white'
});
var label = Ti.UI.createLabel();
window.add(label);
window.open();

// TODO: write your module tests here
var ti_touchdb = require('com.obscure.TiTouchDB');
Ti.API.info("module is => " + ti_touchdb);

ti_touchdb.startListenerOnPort(5985, function() {
  Ti.API.info("started listener!");
});

/*
ti_touchdb.registerMapFunction('test1', function(doc) {
  Ti.API.info('this is test1, doc is '+JSON.stringify(doc));                             
});
*/

/*
Ti.API.info("module exampleProp is => " + ti_touchdb.exampleProp);
ti_touchdb.exampleProp = "This is a test value";

if (Ti.Platform.name == "android") {
	var proxy = ti_touchdb.createExample({
		message: "Creating an example Proxy",
		backgroundColor: "red",
		width: 100,
		height: 100,
		top: 100,
		left: 150
	});

	proxy.printMessage("Hello world!");
	proxy.message = "Hi world!.  It's me again.";
	proxy.printMessage("Hello world!");
	window.add(proxy);
}

*/
