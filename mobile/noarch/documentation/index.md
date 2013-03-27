# TiTouchDB Module

## Description

The TiTouchDB module wraps the TouchDB and CouchCocoa iOS frameworks and provides
a CouchDB-compatible database for your Titanium apps.

The reference section follows these conventions:

* Text in `code font` refer to module objects.  For example, database is a generic term
  but `database` refers to a TiTouchDB object.
* The term "dictionary" is used to distinguish document properties objects from generic
  JavaScript Object types.  Parameters and return values of "dictionary" type are Objects
  with key-value pairs and no functions.
* Object functions are listed with parentheses and properties without.  Constants are
  implemented as read-only properties.
  
NOTE: there are currently some functions that are not yet implemented on Android.  See
the project's issues on Github for a current status on these methods.

## Accessing the Module

To access this module from JavaScript, you would do the following:

	var server = require("com.obscure.TiTouchDB");

<a name="server"/>
## Server

TODO server description

### Properties

**activeTasks**

array of dictionaries, read-only. An list of the active tasks (view compacting, indexing, etc.)
currently running on the server.  See http://wiki.apache.org/couchdb/HttpGetActiveTasks.

**activityPollingInterval**

number, read/write.  Set the interval at which the active tasks will be updated, in seconds.

**replications**

array of [`replication`](#replication) objects, read-only.  The persistent replications stored
in the replicator database.

### Functions

**getVersion**()

Returns the version of TouchDB used to build the module as string.

**generateUUIDs**(count)

* count (number): the number of UUIDs to generate

Return an array of unique identifiers as strings suitable for use as document IDs.

**getDatabases**()

Return an array of all [`database`](#database) objects present in the server.

**databaseNamed**(name)

* name (string): the name of the `database` to return.

Return the [`database`](#database) with the specified name.  If the server does not have a database with
the provided name, returns null.

### Constants

#### Replication State

* REPLICATION\_STATE\_IDLE
* REPLICATION\_STATE\_TRIGGERED
* REPLICATION\_STATE\_COMPLETED
* REPLICATION\_STATE\_ERROR

#### Replication Mode

* REPLICATION\_MODE\_STOPPED
* REPLICATION\_MODE\_OFFLINE
* REPLICATION\_MODE\_IDLE
* REPLICATION\_MODE\_ACTIVE

#### Stale Queries

* STALE\_QUERY\_NEVER
* STALE\_QUERY\_OK
* STALE\_QUERY\_UPDATE\_AFTER

<a name="database"/>
## Database

TODO database description

### Properties

**relativePath**

string, read-only.  The path of the database in the server.  This is always the same as the database
name.

**replications**

array of [`replication`](#replication) objects, read-only.  The persistent replications stored
in the replicator database.

### Methods

**create**()

Create the database object in the server.  Will fail if the database already exists, so it is
usually better to use **ensureCreated**().

**ensureCreated**()

Create the database object on the server if it doesn't already exist.  Returns true if successful.

**deleteDatabase**()

Permanently remove this database and all associated data from the server.

**compact**()

Compacts the database, freeing up disk space by deleting old revisions of documents.  This should be
run periodically, especially after making a lot of changes.  The compact operation is asynchronous.

**getDocumentCount**()

Returns the total number of documents in the database.

**documentWithID**(docid)

* docid (string): the unique ID of the document

Fetch a [`document`](#document) object from the database by its identifier or create a new document with
the provided identifier if it doesn't already exist.  Note that the new document is not saved until a call to
**putProperties**() is made.

**untitledDocument**()

Create a new [`document`](#document) object with a generated identifier.  The identifier *cannot* be
changed after creation; use **documentWithID(id)** to create a document that has a specific identifier.

**getAllDocuments**()

Returns an array of all of the [`document`](#document) objects in the database.

**getDocumentsWithIDs**(ids)

* ids (array of strings): list of the identifiers of documents to return

Returns a [`query`](#query) object that can be used to fetch the documents with the provided IDs.

**putChanges**(propertiesArray)

* propertiesArray (array of dictionaries): the document properties to store in the specified
  revisions.
  
Bulk write multiple documents.  If a dictionary in the `propertiesArray` parameter has a key named
`\_id`, the document with the corresponding ID will be updated or a new document will be created if
that ID does not exist.  If the dictionary does not have an `\_id` key, a new document will be created
with a server-generated ID.

**putChanges**(propertiesArray, revisionsArray)

* propertiesArray (array of dictionaries): the document properties to store in the specified revisions.
  Each element must be a dictionary or null to delete the corresponding document.
* revisionsArray (array of [`revision`](#revision) or [`document`](#document) objects): a parallel array
  of revisions or documents to update or delete.

Bulk write changes to multiple revisions in one call.

**deleteRevisions**(revisionsArray)

* revisionsArray (array of [`revision`](#revision) objects)

Remove the specified revisions.

**deleteDocuments**(documentsArray)

* documentsArray (array of [`document`](#document) objects)

Remove the specified documents

**clearDocumentCache**()

TouchDB caches recently-used documents.  Call **clearDocumentCache**() to empty the cache, which forces
the module to instantiate and return new instances of documents.

**slowQuery**(map, reduce)

* map (string): map function source in JavaScript
* reduce (string, optional): reduce function source in JavaScript or the name of a predefined reduce function

Returns a [`query`](#query) object that runs an arbitrary map/reduce.  This is the equivalent of a CouchDB
temporary view, and as such is very slow compared to a precompiled view.

TODO predefined reduce functions?

**designDocumentWithName**(name)

* name (string): the name of the design document

Fetch or create a [`design document`](#design document) object with the provided name.  If the design document
does not exist, you must call **saveChanges**() to create the document.

**pullFromDatabaseAtURL**(url)

* url (string): the URL of the database to pull from

Set up a one-time replication from a source database to this database and return a [`replication`](#replication)
object.  The returned object can be customized prior to the start of replication.

**pushToDatabaseAtURL**(url)

* url (string): the URL of the database to push to

Set up a one-time replication from this database to a remote target database and return a [`replication`](#replication)
object.  The returned object can be customized prior to the start of replication.

**replicateWithURL**(url, exclusively)

* url (string): the URL of the database to replicate with
* exclusively (boolean): if true, any existing replications with this URL will be removed

Convenience function for setting up two-way replication with a remote database specified by the provided
URL.  Returns an object with a keys named "push" and "pull" whose values are the push [`replication`](#replication)
object and the pull [`replication`](#replication) object, respectively, or null on failure.

**replicationFromDatabaseAtURL**(url)

* url (string): the URL of the database to replicate from

Set up a persistent replication from a source database to this database and return a
[`persistent replication`](#persistent replication) object.  If the persistent replication already exists,
the configuration is unchanged.  The returned object can be customized prior to the start of replication.

**replicationToDatabaseAtURL**(url)

* url (string): the URL of the database to replicate to

Set up a persistent replication from this database to a source database and return a
[`persistent replication`](#persistent replication) object.  If the persistent replication already exists,
the configuration is unchanged.  The returned object can be customized prior to the start of replication.

**registerFilter**(name, code)

* name (string): the name of the filter function to register
* code (string): the JavaScript code that implements the filter function

Register a named filter function in the database for use with filtered replication.  The filter is not
persistent and needs to be registered each time the app is run.  Use the registered filter name in the
`filter` property of the [`persistent replication`](#persistent replication).

<a name="document"/>
## Document

TODO description

### Properties

**documentID**

string, read-only. The unique ID of this document; its key in the database.

**abbreviatedID**

string, read-only. The document ID abbreviated to a maximum of 10 characters including ".." in the middle.
Useful for logging or debugging.

**isDeleted**

boolean, read-only.  True if the document has been deleted from the database.

**currentRevisionID**

string, read-only.  The ID of the current revision.  If not known, returns null.

**properties**

dictionary, read-only

The contents of the current revision of the document; shorthand for `doc.currentRevision.properties`.
Any keys in the returned dictionary that start with an underscore are TouchDB metadata.


### Methods

**deleteDocument**()

Mark the document as deleted from the database.  The next time the database is compacted, the document
will be permanently deleted.

**currentRevision**()

Returns the current [`revision`](#revision) revision object for this document.

**revisionWithID**(revisionId)

* revisionId (string): the identifier of the revision to fetch

Returns the [`revision`](#revision) object with the specified ID or null if no revision with the
ID is present in the document.

**getRevisionHistory**()

Returns an array of available [`revision`](#revision) objects.  The ordering is essentially arbitrary,
but usually chronological unless there has been merging with changes from another server. The number of
historical revisions available may vary; it depends on how recently the database has been compacted.
You should not rely on earlier revisions being available, except for those representing unresolved conflicts.

**putProperties**(properties)

* properties (dictionary): the properties to write to the new document revision.

Updates the document with new properties, creating a new revision.  Except in the case of a new document,
the `properties` parameter *must* contain a key named `\_rev` with a value of the current revision's
revisionID.  Any object returned from **properties** will have this value, so it is usually best to modify
that object and pass it to **putProperties**() to do updates.  Returns 201 for a new document, 200 for
an update, and 412 for a conflict.

**getConflictingRevisions**()

Returns an array of revisions that are currently in conflict, in no particular order. If there is no conflict,
returns an array of length 1 containing only the current revision.

**resolveConflictingRevisions**(conflictsArray, winningRevision)

* conflictsArray (array of [`revision`](#revision) objects): the array of conflicting revisions as returned
  by **getConflictingRevisions**()
* winningRevision ([`revision`](#revision) object or dictionary): if a `revision`, the `revision` from
  conflictsArray whose properties should be used to update the document.  If a dictionary, the properties to
  store into the document to resolve the conflict.

### Events

TODO document change notification when implemened

<a name="attachment"/>
## Attachment

TODO description

### Properties

**revision**

[`revision`](#revision) object, read-only.  The revision that owns this attachment.

**document**

[`document`](#document) object, read-only.  The document that owns this attachment.

**name**

string, read-only.  The filename of the attachment (the final URL path component).

**contentType**

string, read-only.  The MIME type of the attachment.

**length**

number, read-only.  The length of the attachment in bytes.

**metadata**

dictionary, read-only.  The CouchDB metadata for the attachment.

**body**

Titanium.Blob, read/write.  The body data of the attachment.

### Methods

**deleteAttachment**()

Remove the attachment from the owning document and revision.

<a name="revision"/>
## Revision

TODO description

### Properties

**document**

[`document`](#document) object, read-only.  The document that owns this revision.

**documentID**

string, read-only.  The unique identifier of the document that owns this revision.

**revisionID**

string, read-only.  The unique identifier of the revision (the CouchDB "_rev" property).

**isCurrent**

boolean, read-only.  True if this is the latest revision of a document.

**isDeleted**

boolean, read-only.  True if this revision marks the deletion of a document from the database.

**properties**

dictionary, read-only. The contents of the revision. Any keys in the returned dictionary that start with an underscore
are TouchDB metadata.  Revision properties are cached for the lifespan of the object.

**userProperties**

dictionary, read-only. The contents of the revision without the ones reserved for CouchDB.

**propertiesAreLoaded**

boolean, read-only. If true, the revision has fetched properties from the database.

**attachmentNames**

array of strings, read-only. The names of all attachments on this revision.

### Methods

**propertyForKey**(key)

* key (string): key of the property to return

Returns the revision property for the specified key.

**putProperties**(properties)

* properties (dictionary): the properties to write to the new revision.

Creates a new revision with the provided properties.  Returns 200 on success and 412 on conflict.

**attachmentNamed**(name)

* name (string): the name of the attachment to fetch

Returns the [`attachment`](#attachment) object with the specified name or null if the attachment does
not exist.

**createAttachment**(name, contentType)

* name (string): the name of the new attachment
* contentType (string, optional): the MIME type of the new attachment

Creates a new attachment object with the specified name and MIME type.  If a content type is not
specified, it will be set to "application/octet-stream".  The attachment is not saved until the
body is set.  If this method is called with the name of an existing attachment, any changes will
overwrite the existing attachment.

<a name="design document"/>
## Design Document

Design documents extend the [`document`](#document) object, so all properties and methods of that
object are also available on a design document.

### Properties

**language**

string, read/write.  The language for the functions in the design document.

**viewNames**

array of string, read-only.  A list of the names of the views in the design document.

**validation**

string, read/write.  Source code for the document validation function.

**includeLocalSequence**

boolean, read/write.  Set to true to have view query results include the local sequence number in the index.

**changed**

boolean, read-only.  Returns true if the contents of the design document have changed since the last
call to **saveChanges**().

### Methods

**queryViewNamed**(name)

* name (string): the name of the view to query

Return the [`query`](#query) object for the view with the provided name or null if the view does not
exits.  If the view has changed, it will be saved first.

**isLanguageAvailable**(lang)

* lang (string): language to check

Returns true if the specified language can be used for writing functions.

**mapFunctionOfViewNamed**(name)

* name (string): the name of the view

Returns the map function of the view with the given name.

**reduceFunctionOfViewNamed**(name)

* name (string): the name of the view

Returns the reduce function of the view with the given name.

**defineView**(name, map, reduce)

* name (string): the name of the new view
* map (string): source code of the map function
* reduce (string, optional): source code of the reduce function.

Set the definition of a view with the provided map and reduce functions.  If the value of the map
parameter is null, the view will be deleted.

**saveChanges**()

Persist changes to the design document to the underlying database.

<a name="query"/>
## Query

A `query` object is used to set up a query against a CouchDB view.

### Properties

**designDocument**

[`design document`](#design document) object, read-only.  The design document that contains the view
being queried.  May be null for some database-level methods that return a query, like `getAllDocuments`
and `slowQuery`.

**limit**

number, read/write.  The maximum number of rows to return.  Default value is 0, meaning unlimited.

**skip**

number, read/write.  The number of initial rows to skip. Default value is 0.  Should only be used with
small values. For efficient paging, use startKey and limit.

**descending**

boolean, read/write.  Should the rows be returned in descending key order? Default value is false.

**startKey**

scalar|dictionary|array, read/write.  If present, the minimum key value of the first document to return.

**endKey**

scalar|dictionary|array, read/write.  If present, the maximum key value of the last document to return.

**stale**

number, read/write.  If set, allows faster results at the expense of returning possibly out-of-date
data.  One of `server.STALE\_QUERY\_NEVER`, `server.STALE\_QUERY\_OK`, or `server.STALE\_QUERY\_UPDATE\_AFTER`.

**keys**

array of scalar|dictionary|array, read/write.  If set, the query will only fetch rows with the provided
keys.

**groupLevel**

number, read/write.  If non-zero, enables grouping of results that have array keys in views that have
reduce functions.

**prefetch**

boolean, read/write.  If true, query results will include the entire document contents of the associated
rows in the `documentContents` property.

### Methods

**rows**()

Synchronous call to get all of the results of querying the associated view.  Returns a
[`query enumerator`](#query enumerator) object.

<a name="query enumerator"/>
## Query Enumerator

A query enumerator holds the results of a view query.

### Properties

**rowCount**

number, read-only. The number of rows in this view result.

**totalCount**

number, read-only.  The total number of rows in the view result.  May be different than **rowCount**
if `query.skip` or `query.limit` are set.

*NOTE* this property is currently returning the same value as **rowCount**.

**sequenceNumber**

number, read-only.  The current sequence number of the database at the time the view was
generated.

### Methods

**nextRow**()

Returns the next [`query row`](#query row) object in the query results or null if no more rows are
present.  Usually called in a `while` loop.

**rowAtIndex**(index)

* index (number): the index of the row to return

Returns the [`query row`](#query row) object at the specified index or null if there is no row at
that index.

<a name="query row"/>
## Query Row

TODO description

### Properties

**query**

[`query`](#query) object, read-only.  The query object from which this row was generated.

**key**

scalar|dictionary|array, read-only.  The key for this row as emitted by the map/reduce functions.

**value**

scalar|dictionary|array, read-only.  The value for this row as emitted by the map/reduce functions.

**documentID**

string, read-only.  The unique identifier of the document associated with this row.

**sourceDocumentID**

string, read-only.  The unique identifier of the document associated with this row.  It will be the same
as the **documentID** property unless the map function caused a related document to be linked by adding
an `_id` key to the emitted value; in this case **documentID** will refer to the linked document, while
**sourceDocumentID** always refers to the original document.

**documentRevision**

string, read-only.  The revision ID of the source document.

**document**

[`document`](#document) object, read-only.  The document that was used to generate this row.  This will be
null if a grouping was enabled in the query because then the result rows don't correspond to individual
documents.

**documentProperties**

dictionary, read-only.  The properties of the document this row was mapped from.  This property will
be null unless the **prefetch** property on the query was set to true.

### Methods

**keyAtIndex**(index)

* index (number): the array index of the key part to fetch

If the row's key is an array, fetch the key value at the specified index.  If the key is not an array,
index = 0 will fetch the entire key.  If the index is out of range, returns null.

<a name="replication"/>
## Replication

Replicating data to and from a CouchDB database is an asynchronous process.  When you create a `replication`
object, you must ensure that it stays in scope the entire time it is running.  The easiest way to do this
is to declare your replication variable _outside_ of any event handlers or functions.

### Properties

**createTarget**

boolean, read/write.  If true, create the target database if it doesn't already exist.  Default is false.

**continuous**

boolean, read/write.  Should the replication operate continuously, copying changes as soon as the source
database is modified?  Default is false.

**filter**

string, read/write.  Path of an optional filter function to run on the source server.  Only documents for
which the function returns true are replicated.  If the filter is running on a CouchDB instance, the value
of this property looks like "designdocname/filtername".  If the filter is running in TouchDB and was 
registered using `registerFilter()`, then the property should just contain the name used to register the
filter.

**filterParams**

dictionary, read/write.  Parameters to pass to the filter function.

**remoteURL**

string, read-only.  The URL of the remote database.

**pull**

boolean, read-only.  If true, the replication is pulling from the remote database to the local database.

**running**

boolean, read-only.  True if the replication is currently running.

**status**

number, read-only.  The current state of the replication.  One of `server.REPLICATION\_STATE\_IDLE`,
`server.REPLICATION\_STATE\_TRIGGERED`, `server.REPLICATION\_STATE\_COMPLETED`, or `server.REPLICATION\_STATE\_ERROR`.

**completed**

boolean, read-only.  True if the replication is complete.

**total**

number, read-only.  The total number of changes to be processed if the task is active, else 0.

**error**

dictionary, read-only.  The most recent error during replication, if any.

**mode**

number, read-only.  The current mode of the replication.  One of `server.REPLICATION\_MODE\_STOPPED`,
`server.REPLICATION\_MODE\_OFFLINE`, `server.REPLICATION\_MODE\_IDLE`, or `server.REPLICATION\_MODE\_ACTIVE`.

### Methods

**start**()

Starts the replication process.

**stop**()

Stops a running replication process.

### Events

**progress**

* 

<a name="persistent replication"/>
## Persistent Replication

### Properties

**source**

string, read-only.  The source URL for the replication.  This will be either a complete HTTP(s) URL or the
name of a database on this server.

**target**

string, read-only.  The destination URL for the replication. This will be either a complete HTTP(s) URL or
the name of a database on this server.

**remoteURL**

string, read-only.  The URL of the remote database involved in this replication.

**createTarget**

boolean, read/write.  If true, the target database will be created if it does not exist.  Default is false.

**continuous**

boolean, read/write.  Should the replication operate continuously, copying changes as soon as the source
database is modified?  Default is false.

**filter**

string, read/write.  Path of an optional filter function to run on the source server.  Only documents for
which the function returns true are replicated. The path looks like "designdocname/filtername".

**filterParams**

dictionary, read/write.  Parameters to pass to the filter function.

**status**

number, read-only.  The current state of the replication.  One of `server.REPLICATION\_STATE\_IDLE`,
`server.REPLICATION\_STATE\_TRIGGERED`, `server.REPLICATION\_STATE\_COMPLETED`, or `server.REPLICATION\_STATE\_ERROR`.

**completed**

number, read-only.  The number of changes that have been completed.

**total**

number, read-only.  The total number of changes to be processed if the task is active, else 0.

**error**

dictionary, read-only.  The most recent error during replication, if any.

**mode**

number, read-only.  The current mode of the replication.  One of `server.REPLICATION\_MODE\_STOPPED`,
`server.REPLICATION\_MODE\_OFFLINE`, `server.REPLICATION\_MODE\_IDLE`, or `server.REPLICATION\_MODE\_ACTIVE`.

### Methods

**actAsUserWithRoles**(username, roles)

* username (string): a server username or null
* roles (array of strings): an array of CouchDB role names or null

Sets the "user\_ctx" property of the replication, which identifies what privileges it will run with when
accessing the local server. To replicate design documents, this should be set to a value with "\_admin" in
the list of roles. The server will not let you specify privileges you don't have, so the request to create
the replication must be made with credentials that match what you're setting here, unless the server is
in no-authentication "admin party" mode.

*NOTE* is this necessary for TouchDB?

**actAsAdmin**()

Convenience method that calls **actAsUserWithRoles**() with the admin role.

**restart**()

Restarts a replication; this is most useful to make a non-continuous replication run again after it's stopped.

## Usage

See the examples on Github for usage.

TODO explain conflicts and resolution.

## Author

Paul Mietz Egli (paul@obscure.com)

based on TouchDB by Jens Alfke, Marty Schoch and others

## License

Apache License 2.0
