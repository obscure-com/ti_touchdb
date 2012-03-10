Titanium TouchDB Module for iOS
===========================================

by Paul Mietz Egli (paul@obscure.com)

The TiTouchDB module wraps the [TouchDB for iOS](https://github.com/couchbaselabs/TouchDB-iOS)
framework developed by Jens Alfke at Couchbase so it can be called from an app
written with the [Appcelerator Titanium](http://www.appcelerator.com/) cross-platform
mobile development environment.

Note that this module can only be used on iOS devices.  When an Android version of
TouchDB becomes available, I plan to wrap that code as well.

## How to use the module ##

As TouchDB is still pre-alpha, I haven't provided a module binary yet.  If you are
really intrepid, you can clone this repo and try building it yourself.  You will need
to clone the TouchDB-iOS repo into the same directory as TiTouchDB as the module 
references files in TouchDB-iOS by relative path.

Once you have a binary, declare the module in your tiapp.xml file:

    <module version="0.1">com.obscure.TiTouchDB</module>

Now you can import the module and start up the TouchDB HTTP listener on your port
of choice:

    var ti_touchdb = require('com.obscure.TiTouchDB');
    ti_touchdb.startListenerOnPort(5985, function() {
      Ti.API.info("started listener!");
    });
    

Once a listener is started, you use Ti.Network.HttpClient to talk to the database
using the standard CouchDB HTTP protocol.

## License ##
 
 * Module wrapper code is under the Apache License 2.0.
 * Appcelerator Titanium is under the Apache License 2.0.
 * TouchDB is under the Apache License 2.0.

Each of these components may contain code released under other licenses.
