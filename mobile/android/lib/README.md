2014-05-22

At the moment, installing the Couchbase Lite Android libraries isn't as simple as
copying them from the distribution.  The `couchbase-lite-java-core-1.0.0.jar`
file contains classes that overlap with Titanium, and the `webserver.jar` file
was built with an old, incompatible class file format.

My goal is to remove these files, however, so don't count on them being here forever!