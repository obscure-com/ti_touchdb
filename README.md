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

* Titanium SDK 2.1.0 or later
* Xcode 4.3 or later to build
* Runtime requirement is iOS 5+

## License

* TiTouchDB is under the Apache License 2.0
* TouchDB is under the Apache License 2.0. See that project for additional licenses.

## Development Status - iOS

**alpha**

Many people reported build issues with the previous organization of the project which had
TouchDB-iOS and CouchCocoa as submodules.  I've reworked the project so it builds from binary
versions of those frameworks instead of source, which should address this issue.

The project currently builds with TouchDB-iOS version 0.9, which is a beta build.

## Development Status - Android

**alpha**

The Android version of the module passes all of the unit tests except replication, which I
haven't implemented yet.  This is enough of a milestone that I've uploaded a binary build to
the Downloads section.  Once Android has replication in place, I'll bump the version number
to match the iOS version.

