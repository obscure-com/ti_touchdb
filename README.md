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
* Xcode 4.5 or later
* Runtime requirement is iOS 5+

## License

* TiTouchDB is under the Apache License 2.0
* TouchDB is under the Apache License 2.0. See that project for additional licenses.

## Development Status - iOS

**0.5-beta**

2012-10-11

Added support for filters; new tutorial code under samples

2012-10-01

Fixed problem with map and reduce functions being garbage collected by the JS context.

2012-08-30

Brand-spanking new TouchBooks example built with the "Master/Detail" application template
from Titanium Studio.  The new code should be much easier to understand, and as a bonus
it includes push and pull replication to an IrisCouch server!

Latest build of the project uses the head of TouchDB-iOS to get a JSON view collation bug
fix.

## Development Status - Android

**0.5-beta**

2012-10-11

Faked the persistent replication classes for API compatibility with iOS by wrapping TDReplicator;
will update when TouchDB-Android has persistent replication.

2012-08-30

The new TouchBooks example also works on Android.  It's cool.  Check it out.

Android version uses the latest version to TouchDB-Android.  Replication is working in the
test case and in TouchBooks, but Marty Schoch, the author of TouchDB-Android, reports that
there are issues with the replicator, so proceed with caution.
