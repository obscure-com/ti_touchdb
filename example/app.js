// open a single window
var window = Ti.UI.createWindow({
	backgroundColor:'white'
});
var label = Ti.UI.createLabel();
window.add(label);
window.open();

// TODO: write your module tests here
var ti_touchdb = require('com.obscure.ti_touchdb');
Ti.API.info("module is => " + ti_touchdb);

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