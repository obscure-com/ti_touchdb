Titanium TouchDB Module for iOS
===========================================

by Paul Mietz Egli (paul@obscure.com)

The TiTouchDB module wraps the [TouchDB for iOS](https://github.com/couchbaselabs/TouchDB-iOS)
and [CouchCocoa](https://github.com/couchbaselabs/CouchCocoa)
frameworks developed by Jens Alfke and others at Couchbase so it can be called from an app
written with the [Appcelerator Titanium](http://www.appcelerator.com/) cross-platform
mobile development environment.

Note that this module can only be used on iOS devices.  When an Android version of
TouchDB becomes available, I plan to wrap that code as well.

## How to use the module ##

Module builds can be downloaded from the Download page of this Github project.  If you are
really intrepid, you can clone this repo and try building it yourself.

Once you have a binary, declare the module in your tiapp.xml file:

    <module platform="iphone">com.obscure.titouchdb</module>

Now you can import the module and start up the TouchDB HTTP listener on your port
of choice:

    var titouchdb = require('com.obscure.titouchdb');
    var mgr = titouchdb.databaseManager;
    var db = mgr.createDatabaseNamed('testfoo');

See the [documentation](https://github.com/pegli/ti_touchdb/blob/master/mobile/ios/documentation/index.md)
for a list of methods and the [sample projects](https://github.com/pegli/ti_touchdb/tree/master/samples)
for examples of the code in use.

## License ##
 
 * Module wrapper code is under the Apache License 2.0.
 * Appcelerator Titanium is under the Apache License 2.0.
 * TouchDB is under the Apache License 2.0.

Each of these components may contain code released under other licenses.
