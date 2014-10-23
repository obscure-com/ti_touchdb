2014-10-01

* Moved HTTP listener management from the module to the DatabaseManager class.
* Added listener support to Android 

2014-08-26

* Updated to Couchbase Mobile 1.0.2 release for Android and iOS
* Fixed memory leak of CBL query objects (issue 80)
* Modified the Alloy sync adapter configuration to allow specifying
    query properties with the view definition.
* Added data model migration support to the sync adapter.


2014-07-30

### Database

* added `createSlowQuery(mapfn)` method.

2014-06-10

Initial release of module based on [couchbase-lite-ios](https://github.com/couchbase/couchbase-lite-ios)
and [couchbase-lite-android](https://github.com/couchbase/couchbase-lite-android) version 1.0.0.

2014-01-20

The couchbase-lite-ios project is undergoing another set of API changes, which
I'm tracking in the cblite\_api\_changes branch.  This is a summary of the changes
to date:

### TiTouchDB module

* Added `enableLogging(category)`
* Replaced query staleness properties:
    * `STALE_QUERY_NEVER` -> `QUERY_UPDATE_INDEX_BEFORE`
    * `STALE_QUERY_OK` -> `QUERY_UPDATE_INDEX_NEVER`
    * `STALE_QUERY_UPDATE_AFTER` -> `QUERY_UPDATE_INDEX_AFTER`

### Database Manager

* Added `isValidDatabaseName(name)` function
* Added `defaultDirectory` property
* Added `directory` property
* Semantics change to the database creation methods: `databaseNamed(name)`
  now returns a database with the given name or creates it if it doesn't
  exist.  The new `existingDatabaseNamed(name)` will return an existing
  database or null if the database with the provided name does not exist.
  These are the new semantics of the couchbase-lite-ios library.

### Database

* Added `maxRevTreeDepth` property.
* Added `existingDocumentWithID(id)` method to return an existing document or
  null if the document with the specified ID does not exist.  The `documentWithID(id)`
  method will continue to return a new document if the document ID passed to it
  does not exist.
* Renamed `untitledDocument()` to `createDocument()`.
* Renamed `queryAllDocuments()` to `createAllDocumentsQuery()`.
* Added `existingViewNamed(name)` which returns an existing view or null.  The
  `viewNamed(name)` function continues to create a view if it doesn't exist.
* Renamed `pushToURL(url)` to `createPushReplication(url)`. 
* Renamed `pullFromURL(url)` to `createPullReplication(url)`. 
* Removed `replicateWithURL()`.

### Document

* Renamed `newRevision()` to `createRevision()`.

### Query

* Renamed `rows()` to `run()`.
* Renamed `stale` property to `updateIndex`.  Use the staleness constants defined on
  the module for this property.

### Revision

* Renamed `isDeleted` property to `isDeletion`.
* Added `isGone` property.  This is slightly different that `isDeletion` in that it also
  checks for the presence of a `_removed` property in the doc (presumably for Sync Gateway).
* Removed `propertiesAreLoaded` property.
* Added `propertiesAvailable` property.
* Renamed `newRevision()` to `createRevision()`.
* Added ability to set `userProperties` on an unsaved revision.
* Renamed `addAttachment` to `setAttachment`.

### Attachment

* Renamed `body` to `content` and `bodyURL` to `contentURL`.
* Removed `updateBody()` method; correct usage is to create a new revision with the updated
  body content.

### View

* Added `stale` property
* Added `lastSequenceIndexed` property
* Added `deleteIndex()` method.
* Added `deleteView()` method.
* Renamed `query()` to `createQuery()`.

### Query

* Added `mapOnly` property.
* Added `allDocsMode` property.
* Removed `rowsIfChanged()` method.

### Query Enumerator

* Added `stale` property.
* Added `reset()` method.

### Query Row

* Renamed `localSequence` to `sequenceNumber`.
* Renamed `documentRevision` to `documentRevisionID`.

### Replication

* Removed `persistent` property as persistent replications are no longer supported
* Renamed `create_target` to `createTarget`.
* Renamed `query_params` to `filterParams`.
* Renamed `doc_ids` to `documentIDs`.
* Added `network` property.
* Renamed `changes` to `completedChangesCount`.
* Renamed `total` to `changesCount`.
* Renamed `error` to `lastError`.
* Renamed `mode` to `status`.
