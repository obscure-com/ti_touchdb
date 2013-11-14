# TiTouchDB

by Paul Mietz Egli (paul@obscure.com)
based on Couchbase Lite iOS by Jens Alfke (http://github.com/couchbase/couchbase-lite-ios)
and Couchbase Lite Android by Traun Leyden (http://github.com/couchbase/couchbase-lite-android)

**TiTouchDB** is an Appcelerator Titanium module which wraps Couchbase Lite, the lightweight, CouchDB-compatible
database suitable for embedding into mobile apps.

## Using the Module

See the Wiki pages for usage instructions and the samples directory for example apps.

## Requirements

* Titanium SDK 3.1.0 or later
* Xcode 4.5 or later (iOS), runtime requirement is iOS 5+
* Android SDK r21.1, runtime requirement is android-8

## Downloads

Prebuilt modules are hosted on Amazon S3:

* [com.obscure.titouchdb-android-0.9.zip](https://pegli.github.s3.amazonaws.com/com.obscure.titouchdb-android-0.9.zip),
  built 6 Jun 2013
* [com.obscure.titouchdb-iphone-0.9.zip](https://pegli.github.s3.amazonaws.com/com.obscure.titouchdb-iphone-0.9.zip),
  built 6 Jun 2013

## License

* TiTouchDB is under the Apache License 2.0
* Couchbase Lite is under the Apache License 2.0. See that project for additional licenses.

## Development Status - iOS

**1.0-beta**

2013-11-13

Fixed replication progress notifications!

Updated to the latest `couchbase-lite-ios` code.  Jens added a new feature where the database
manager could be provided with a GCD queue to use for running background operations, which should
decrease the thread-related issues we've been having.

2013-05-17

Merged `public-api` branch to master.  Please see [the docs](https://github.com/pegli/ti_touchdb/wiki/API)
for changes to the module APIs.

2013-02-06

Lots of changes in the TouchDB-iOS world!  Jens has been working on a
[new, in-process API](https://github.com/couchbaselabs/TouchDB-iOS/wiki/API-Transition)
that replaces the HTTP listener plus CouchCocoa system that was previously the recommended way
of using TouchDB.  The "public API" branch in the TouchDB repo where this work has been done
will be the basis for the 1.5 release of TouchDB.  In addition, TouchDB 1.5 will be
[renamed to Couchbase Lite](https://groups.google.com/forum/?fromgroups=#!topic/mobile-couchbase/vaB8H1dlagA).
The code has already been moved to [new Github repo](https://github.com/couchbase/couchbase-lite-ios)
and its internal names have been modified to reflect the branding change.  The *public-api*
branch of this project is where I have been working to integrate these API changes.  When
Couchbase Lite 1.5 goes beta, I will be merging public-api to master.

2013-01-18

TouchDB-iOS has a new branch named `public-api` which removes the need for CouchCocoa
and changes all of the calls to in-process rather than deferred/HTTP.  I've created a
public-api branch in this repo where I will be converting the module to use the updated
library calls.


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

**0.9**

2013-06-05

Android parity with iOS!  Well, almost.  The Android version of the module doesn't support
internal replication (replicating from one database to another within TiTouchDB), but all
of the other test cases are passing and the TouchBooksAlloy sample is working.

2013-05-17

Merged `public-api` branch to master.  Android is passing tests 001-005; working on
implementing the rest of the unit tests.

2012-10-11

Faked the persistent replication classes for API compatibility with iOS by wrapping TDReplicator;
will update when TouchDB-Android has persistent replication.

2012-08-30

The new TouchBooks example also works on Android.  It's cool.  Check it out.

Android version uses the latest version to TouchDB-Android.  Replication is working in the
test case and in TouchBooks, but Marty Schoch, the author of TouchDB-Android, reports that
there are issues with the replicator, so proceed with caution.
