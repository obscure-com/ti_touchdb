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

**pre-alpha**

I'm working on getting the iOS version up and running.  Once it is reasonably stable, I'll post a binary
for download and will start on the Android version.

This module will eventually contain an in-process API similar to CouchCocoa.