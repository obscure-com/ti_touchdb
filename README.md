# TiTouchDB

by Paul Mietz Egli (paul@obscure.com)
based on TouchDB-iOS by Jens Alfke (http://github.com/couchbaselabs/TouchDB-iOS)

**TiTouchDB** is an Appcelerator Titanium module which wraps TouchDB, the lightweight, CouchDB-compatible
database suitable for embedding into mobile apps.

Because the Titanium runtime already contains a JavaScript interpreter, TiTouchDB can run standard JavaScript
map and reduce functions directly from design documents, just like Apache CouchDB.

## Using the Module

See the Wiki pages for usage instructions and the samples directory for example apps.

## Requirements

* Titanium SDK 1.8.2 or later
* Xcode 4.2 or later to build
* Runtime requirement is iOS 5+

## License

* TiTouchDB is under the Apache License 2.0
* TouchDB is under the Apache License 2.0. See that project for additional licenses.

## Development Status

**refactoring**

TouchDB and CouchCocoa are now submodules of this project.  If you are building from source,
please read the [Building](https://github.com/pegli/ti_touchdb/wiki/Building) page on the
wiki for changes to the build process.

TouchDB is being combined with CouchCocoa and a new client/server framework called SyncPoint.  The
initial impact of this is that the TouchDB APIs are essentially being pushed beneath CouchCocoa.
This module currently exposes the TouchDB API, but CouchCocoa is the future, so I'm refactoring
the module to conform to the [CouchCocoa API](https://github.com/couchbaselabs/CouchCocoa).  Read
more about this effort here:

https://groups.google.com/d/topic/mobile-couchbase/cJXGe5vijSY/discussion
