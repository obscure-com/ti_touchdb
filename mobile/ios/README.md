Titanium TouchDB Module for iOS
===========================================

by Paul Mietz Egli (paul@obscure.com)

## How to use the module ##

1. Download the prebuilt module using the link on the [main project page](https://github.com/pegli/ti_touchdb).
1. Download the CouchbaseLite release from the [Couchbase Mobile developer portal](http://www.couchbase.com/download#cb-mobile).
1. In your Downloads folder, you should find a folder named `couchbase-lite-ios-community-1.0.0` (version number may vary).
   In that folder, find the `CouchbaseLite.framework` and `CouchbaseLiteListener.framework` bundles and
   copy them to `~/Library/Frameworks`.
1. Declare the module in your tiapp.xml file by adding the following to the `<modules>` section:

    <module platform="iphone">com.obscure.titouchdb</module>

1. In your application code, import the module as follows:

    var titouchdb = require('com.obscure.titouchdb');

See the [documentation](https://github.com/pegli/ti_touchdb/blob/master/mobile/ios/documentation/index.md)
for a list of methods and the [sample projects](https://github.com/pegli/ti_touchdb/tree/master/samples)
for examples of the code in use.

## License ##
 
 * Module wrapper code is under the Apache License 2.0.
 * Appcelerator Titanium is under the Apache License 2.0.
 * TouchDB is under the Apache License 2.0.

Each of these components may contain code released under other licenses.
