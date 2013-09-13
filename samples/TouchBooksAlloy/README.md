TouchBooksAlloy
===============

See the [Alloy and TouchDB Tutorial](https://github.com/pegli/ti_touchdb/wiki/Alloy-and-TouchDB-Tutorial)
on the wiki for information about this sample app.

Running the App
---------------

If you just want to run the TouchBooksAlloy sample app, follow these steps:

1. Build or obtain a binary ZIP file of the ti_touchdb module for iOS or Android.  Make sure the version
of the file matches the declared version in `tiapp.xml`.
1. Copy or symlink `mobile/noarch/alloy/sync/titouchdb.js` to `app/lib/alloy/sync/titouchdb.js`.
1. The first time you build, you need to run `mkdir Resources` and `touch Resources/app.js` to get around
a problem with the Titanium CLI.
1. Run `titanium build -p iphone` or `titanium build -p android` to run the app in the appropriate simulator.

If you would like to test replication, create an `app/config.json` file with a global configuration for
your remote CouchDB instance:

```javascript
{
  "global": {
    "remote_couchdb_server": "http://my.iriscouch.com/mydbname"
  }
}
```
