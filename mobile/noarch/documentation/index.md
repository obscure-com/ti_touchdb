This document follows these conventions:

* Text in `code font` refer to module objects.  For example, database is a generic term
  but `database` refers to a TiTouchDB object.
* The term "dictionary" is used to distinguish document properties objects from generic
  JavaScript Object types.  Parameters and return values of "dictionary" type are Objects
  with key-value pairs and no functions.
* Object functions are listed with parentheses and properties without.  Constants are
  implemented as read-only properties.
  
NOTE: there are currently some functions that are not yet implemented on Android.  See
the project's issues on Github for a current status on these methods.

If you aren't familiar with the Couchbase Lite data model, take a look at the excellent
[documentation](https://github.com/couchbase/couchbase-lite-ios/wiki/Guide%3A-Data-Model)
provided by that project.  These docs will give you a more in-depth description of
databases, documents, revisions, and the rest of the objects described in this API reference.

## Table of Contents

* [Module](#module)
* [Database Manager](#databaseManager)
* [Database](#database)
* [Document](#document)
* [Attachment](#attachment)
* [View](#view)
* [Query](#query)
* [Query Enumerator](#query_enumerator)
* [Query Row](#query_row)
* [Replication](#replication)

## Accessing the Module

To access this module from JavaScript, you would do the following:

	var titouchdb = require("com.obscure.titouchdb");

<a name="module"/>
## Module

Global functions, properties, and constants.

### Properties

**databaseManager**

[`databaseManager`](#databaseManager) object, read-only.  The shared database manager instance.

### Methods

**startListener**(options)

* options (dict): listener options (defaults shown below)
    * port (number, 5984): listener port
    * readOnly (bool, false): set to true to only allow reads

Start a simple HTTP server that provides remote access to the REST API as documented in the
[Couchbase Lite wiki](https://github.com/couchbase/couchbase-lite-ios/wiki/Guide%3A-REST).
The listener can also be used to peer-to-peer replication.

**stopListener**()

Stop the listener if it is running.

### Constants

#### Replication Mode

* REPLICATION_MODE_STOPPED
* REPLICATION_MODE_OFFLINE
* REPLICATION_MODE_IDLE
* REPLICATION_MODE_ACTIVE

#### Stale queries

* QUERY_UPDATE_INDEX_BEFORE
* QUERY_UPDATE_INDEX_NEVER
* QUERY_UPDATE_INDEX_AFTER

#### Query options

* QUERY_ALL_DOCS
* QUERY_INCLUDE_DELETED
* QUERY_SHOW_CONFLICTS
* QUERY_ONLY_CONFLICTS

<a name="databaseManager"/>
## DatabaseManager

Applications interact with the various TiTouchDB databases using the Database Manager.

### Properties

**allDatabaseNames**

array of strings, read-only.  Return the names of all existing databases.

**defaultDirectory**

string, read-only.  The default data storage directory.

**directory**

string, read-only.  The actual data storage directory.

**error**

dictionary, read-only.  The most-recent error that occurred in the database manager.

### Methods

**close**()

Closes the manager and all its databases.

**getDatabase**(name)

* name (string): the name of the `database` to open or create.

Returns the [`database`](#database) with the given name, creating it if it didn't already exist.
Multiple calls with the same name will return the same object instance.
NOTE: Database names may not contain capital letters and may not start with an underscore!

**getExistingDatabse**(name)

* name (string): the name of the `database` to return.

Return the [`database`](#database) with the specified name.  If the database manager does not have a database with
the provided name, returns null.  Multiple calls with the same name will return the same object instance.

**isValidDatabaseName**(name)

* name (string): the prospective database name to test

Returns true if the provided string can be used as a database name.  (Only the characters in 
"abcdefghijklmnopqrstuvwxyz0123456789_$()+-/" are allowed.)

**replaceDatabase**(name, pathToDatabase, pathToAttachments)

* name (string): the name of the `database` to install
* pathToDatabase (string): the path of the .touchdb database file to install
* pathToAttachments (string): the path of the attachments directory to install

Replaces or installs a database from a file.  This is primarily used to install a canned database on first
launch of an app, in which case you should first check .exists to avoid replacing the database if it exists
already.  Returns true if the database was copied successfully.

<a name="database"/>
## Database

A database is a collection of documents and functions which operate upon the documents (views, filters,
and validations).  Databases in TiTouchDB are primarily namespaces for document collections.

Note on replication: the methods which create [`Replication`](#replication) objects can take either 
a URL of a remote CouchDB database or the name of a database running under the current
[`DatabaseManager`](#databaseManager).

### Properties

**allReplications**

array of [`replication`](#replication) objects, read-only.  A list of all running replications for
this database.

**documentCount**

integer, read-only.  The number of documents in the database.

**error**

dictionary, read-only.  The most-recent error that occurred in the database.

**lastSequenceNumber**

integer, read-only. The latest sequence number used.  Every new revision is assigned a new sequence number,
so this property increases monotonically as changes are made to the database. It can be used to check whether
the database has changed between two points in time.

**manager**

DatabaseManager object, read-only.  The database manager used to create this database.

**name**

string, read-only.  The database's name.


### Methods

**compact**()

Compacts the database, freeing up disk space by deleting old revisions of documents.  This should be
run periodically, especially after making a lot of changes.  The compact operation is asynchronous.

**createAllDocumentsQuery**()

Returns a [`query`](#query) that matches all documents in the database.
This is like querying an imaginary view that emits every document's ID as a key.

**createDocument**()

Create a new [`document`](#document) object with a generated identifier.  The identifier *cannot* be
changed after creation; use **documentWithID(id)** to create a document that has a specific identifier.

**createPullReplication**(url)

* url (string): the URL of the remote database to pull from or a local database.

Set up a one-time replication from a source database to this database and return a [`replication`](#replication)
object.  The returned object can be customized prior to the start of replication.

**createPushReplication**(url)

* url (string): the URL of the remote database to push to or the name of a local database

Set up a one-time replication from this database to a remote target database and return a [`replication`](#replication)
object.  The returned object can be customized prior to the start of replication.

**deleteDatabase**()

Permanently delete this database and all of its documents.

**deleteLocalDocument**(docid)

* docid (string): the unique id of the local document to delete

Delete a local document with the specified ID.

**getDocument**(docid)

* docid (string, optional): the unique ID of the document

Fetch a [`document`](#document) object from the database by its identifier or create a new document with
the provided identifier if it doesn't already exist.  Note that the new document is not saved until a call to
**putProperties**() is made.  If no document ID is provided, one will be generated.

**getExistingDocument**(docid)

* docid (string): the unique ID of the document

Fetch a [`document`](#document) object from the database by its identifier.  Returns null if a document with
the provided identifier doesn't already exist.

**getExistingLocalDocument**(docid)

* docid (string): the unique ID of the local document

Fetch a local [`document`](#document) object from the database by its identifier.  Returns null if a local
document with the provided identifier doesn't already exist.

**getExistingView**(name)

* name (string): the name of the view to fetch

Returns a [`view`](#view) object with the given name or null if no view with the provided name exists.

**getFilter**(name)

* name (string): the name of the filter function to fetch

Get the filter function defined for the given name, or null if it does not exist.

**getValidation**(name)

* name (string): the name of the validation function to fetch

Get the validation function defined for the given name, or null if it does not exist.

**getView**(name)

* name (string): the name of the view to fetch

Returns a [`view`](#view) object with the given name. (This succeeds even if the view doesn't
already exist, but the view won't be added to the database until it is assigned a map function.)

**putLocalDocument**(docid, doc)

* docid (string): the identifier of the local document to save
* doc (dictionary): the document properties

Set the contents of the local document with the specified document ID.

**runAsync**(fn)

* fn (function(db)): the function to run

Asynchronously run a function, providing a reference to the current database as a function parameter.

**setFilter**(name, filter)

* name (string): the name of the filter function
* filter (function(rev, params)): the filter function, return true to replicate the revision. Set this
  argument to null to remove the named filter function.
    * rev: the saved revision object to be validated
    * params: the filter params (currently null)

Defines or clears a named filter function. Filters are used by push replications to choose which documents to send.

**setValidation**(name, validate)

* name (string): the name of the validation function
* validate (function(rev, context)): the validation function, return true to accept revision. Set this
  argument to null to remove the named validation function.
    * rev: the saved revision object to be validated
    * context: the validation context

Defines or clears a named document validation function. Before any change to the database, all registered
validation functions are called and given a chance to reject it. (This includes incoming changes from a
pull replication.)

### Events

**change**: fired when modifications are made to the documents in the database.

<a name="document"/>
## Document

A document is a JSON object consisting of arbitrary key-value pairs.  Each document in a database
has a unique identifier and may be fetched using this ID or located as part of a query on a view
object.  Document properties that begin with an underscore are reserved.

### Properties

**conflictingRevisions**

array of [`revision`](#revision), read-only. Get all of the current conflicting revisions for the document, or an array
containing only the current revision if there are no conflicts.

**currentRevision**

[`revision`](#revision), read-only.  The current/latest revision. This object is cached

**currentRevisionID**

string, read-only.  The ID of the current revision.  If not known, returns null.

**database**

[`database`](#database), read-only. The database that contains this document.

**deleted**

boolean, read-only.  True if this document has been deleted.

**documentID**

string, read-only. The unique ID of this document; its key in the database.

**error**

dictionary, read-only.  The most-recent error that occurred in the document.

**leafRevisions**

array of [`revision`](#revision), read-only. Get all of the current leaf revisions for the document,
including deleted revisions (i.e. previously-resolved conflicts.)

**properties**

dictionary, read-only

The contents of the current revision of the document; shorthand for `doc.currentRevision.properties`.
Any keys in the returned dictionary that start with an underscore are TouchDB metadata.

**revisionHistory**

array of [`revision`](#revision), read-only. Returns an array of available [`revision`](#revision) objects.
The ordering is essentially arbitrary, but usually chronological unless there has been merging with changes
from another server. The number of historical revisions available may vary; it depends on how recently the
database has been compacted. You should not rely on earlier revisions being available, except for those
representing unresolved conflicts.

**userProperties**

dictionary, read-only

The value of `properties` with all of the reserved keys removed.


### Methods

**createRevision**()

Creates an unsaved new [`revision`](#revision) whose parent is the current revision,
or which will be the first revision if the document doesn't exist yet.
You can modify this revision's properties and attachments, then save it.
No change is made to the database until/unless you save the new revision.

**deleteDocument**()

Mark the document as deleted from the database.  The next time the database is compacted, the document
will be permanently deleted.

**getProperty**(key)

* key (string): the key of the property in the document to return.

Return the value of the document property specified by the `key` argument.

**getRevision**(revisionId)

* revisionId (string): the identifier of the revision to fetch

Returns the [`revision`](#revision) object with the specified ID or null if no revision with the
ID is present in the document.

**purgeDocument**()

Purges this document from the database; this is more than deletion, it forgets entirely about it.
The purge will NOT be replicated to other databases.

**putProperties**(properties)

* properties (dictionary): the properties to write to the new document revision.

Updates the document with new properties, creating a new revision.  Except in the case of a new document,
the `properties` parameter *must* contain a key named `_rev` with a value of the current revision's
revisionID.  Any object returned from **properties** will have this value, so it is usually best to modify
that object and pass it to **putProperties**() to do updates.  Returns a new [`revision`](#revision)
object or null if the put failed.


### Events

**change**: fired when modifications are made to the document.


<a name="attachment"/>
## Attachment

Documents may contain zero or more binary attachments of any type.  Attachments are opaque data; they
cannot be queried with view functions.

### Properties

**content**

Titanium.Blob, read-only.  The body data of the attachment.

**contentType**

string, read-only.  The MIME type of the attachment.

**document**

[`document`](#document) object, read-only.  The document under which this attachment is stored.

**error**

dictionary, read-only.  The most-recent error that occurred in the attachment.

**length**

number, read-only.  The length of the attachment in bytes.

**metadata**

dictionary, read-only.  The CouchDB metadata for the attachment.

**name**

string, read-only.  The filename of the attachment (the final URL path component).

**revision**

[`revision`](#revision) object, read-only.  The revision under which this attachment is stored.


<a name="revision"/>
## Revision

A revision is a version of a document stored in the database.  Each time changes are made to a document --
for example, through a call to `putProperties()` or by adding a new attachment -- a new revision of that
document is created.  Revisions are used to coordinate changes that come from multiple sources and to 
determine if incoming changes will result in a conflict in the document contents.  Revisions are *not* a
version control system for your documents, however, as they can be permanently removed by a database
`compact` operation.

In TiTouchDB, there are two types of revision objects: saved revisions that have been persisted into
the database and new revisions that are returned by the `createRevision()` method on the `database` and
existing revision objects.  Think of new revision objects as scratchpads where you can add properties and
attachments in multiple steps prior to saving.

`Revision` is the base class for [`SavedRevision`](#savedrevision) and [`UnsavedRevision`](#unsavedrevision)

### Properties

**attachmentNames**

array of strings, read-only. The names of all attachments on this revision.

**attachments**

array of [`attachment`](#attachment) objects, read-only. All attachments on this revision.

**error**

dictionary, read-only.  The most-recent error that occurred in the revision.

**database**

[`database`](#database) object, read-only. The database where this revision is stored.

**isDeletion**

boolean, read-only for saved revisions; read-write for unsaved revisions.  True if this revision marks
the deletion of a document from the database.

**parent**

[`revision`](#revision) object, read-only.  The previous revision object in this document's local history.

**parentID**

string, read-only.  The identifier previous revision object in this document's local history.

**properties**

dictionary, read-only for existing revisions; read-write for new revisions. The contents of the revision.
Any keys in the returned dictionary that start with an underscore are reserved.  Revision properties are
cached for the lifespan of the object.

**revisionHistory**

array of [`revision`](#revision) object, read-only.  Returns the history of this document in forward order.
Older revisions are NOT guaranteed to have their properties available.

**revisionID**

string, read-only.  The unique identifier of the revision (the CouchDB "_rev" property).

**userProperties**

dictionary, read-only on saved revision. The contents of the revision without the ones reserved for the
database.  Can be set on unsaved revisions.

### Methods

**getAttachment**(name)

* name (string): the name of the attachment to fetch

Returns the [`attachment`](#attachment) object with the specified name or null if the attachment does
not exist.

**getDocument**()

Returns the [`document`](#document) object that this revision belongs to.

**getProperty**(key)

* key (string): the key for the revision property to fetch

Returns the revision property associated with the provided key.


<a name="savedrevision"/>
## SavedRevision

A SavedRevision is a revision object that has been persisted to the database.  SavedRevisions may
not be modified.

### Properties

**propertiesAvailable**

boolean, read-only. True if the properties of this revision are available.  Always true for the current
revision of a document but may be false for older revisions.

### Methods

**createRevision**(properties)

* properties (dictionary, optional)

Create a new [`UnsavedRevision`](#unsavedrevision) object.  If `properties` are specified, the new
revision will contain those property values; otherwise, the new revision will contain the values of
the current revision properties.

**deleteDocument()**

Permanently delete the document that contains this revision.

<a name="unsavedrevision"/>
## UnsavedRevision

An UnsavedRevision is a revision that has not yet been persisted to the database.  UnsavedRevision
objects are used to add new properties and attachments to a document.

### Properties

NOTE: `isDeletion`, `properties`, and `userProperties` are all writable on UnsavedRevision objects.

### Methods

**setAttachment**(name, contentType, content)

* name (string): the name of the new attachment
* contentType (string): the MIME type of the new attachment
* content (TiBlob): the attachment content

Creates a new attachment object with the specified name, MIME type, and content.  The attachment
data will be written to the database when the revision is saved.

**removeAttachment**(name)

* name (string): the name of the attachment to remove

Deletes any existing attachment with the given name.  The attachment will be deleted from the
database when the revision is saved.

**save**()

Save a new revision object to the database.  Returns the saved revision as an existing revision object;
after calling `save()`, you should use the returned object for any further actions instead of the
new revision object.

<a name="view"/>
## View

A view provides a means of indexing documents in a database so they can be fetched based on their
properties.  View indexes are built by applying a map function to each document in the database which
can choose to output an index key and optional value for the document.  Once a view index has
been built, a [`query`](#query) object can be used to fetch all or part of the index along with
the documents used to build the index.

View objects are fetched or created by calling the `viewNamed()` function on the database object.
Once you have a view object, you can specify the map function as a standard JavaScript callback:

    var view = database.viewNamed('myview');
    view.setMap(function(doc) {
      if (doc.properties.type == 'book') {
        emit(doc.properties.created, doc.properties.title);
      }
    });

Map functions take one parameter named `doc` which will contain a [`document`](#document) object.  Views
can also have an optional "reduce" function which can be used to summarize the output of the map function.
See [the CouchDB book](http://guide.couchdb.org/draft/views.html#reduce) for a discussion of reduce
functions.

*NOTE*: views are not persistent objects in TiTouchDB.  You must register your views each time the
application is run.

### Properties

**database**

[`database`](#database) object, read-only. The database where this view is stored.

**isStale**

boolean, read-only.  True if the view has not indexed all documents.

**lastSequenceIndexed**

integer, read-only. The internal sequence number of the last document that was indexed by this view.

**map**

function, read-only.  The map function for this view.

**name**

string, read-only.  The name of the view.

**reduce**

function, read-only.  The reduce function for this view, or null if no reduce function has been defined.

### Methods

**createQuery**()

Return a [`query`](#query) object that can be used to fetch the keys, values, and documents from this
view's index.

**deleteView()**

Permanently delete this view.

**deleteIndex()**

Deletes the view's persistent index, which will be regenerated on the next query.

**setMap**(map)

* map (function(document)): the map function for this view

Set the map function for the view.  Calling setMap(null) will delete the view.

**setMapReduce**(map, reduce)

* map (function(document)): the map function for this view
* reduce (function(keys, values, rereduce)): the reduce function for this view.
    * keys (array of object): an array of keys output by the map function
    * values (array of object): an array of objects output by the map function
    * rereduce (boolean): indicates that some of the keys/values provided have already been reduced.

Set the map and reduce functions for the view.  See the [CouchDB documentation](http://wiki.apache.org/couchdb/Introduction_to_CouchDB_views)
for details on reduce functions.

<a name="query"/>
## Query

Query objects are used to fetch keys, values, and documents from view indexes.

### Properties

**allDocsMode**

integer, read/write.  Set the behavior of a query created by `createAllDocumentsQuery()`.  Can be
set to one of the following:

* `TiTouchDb.QUERY_ALL_DOCS`: the query returns all non-deleted documents (default).
* `TiTouchDB.QUERY_INCLUDE_DELETED`: the query also returns deleted documents.
* `TiTouchDB.QUERY_SHOW_CONFLICTS`: the `conflictingRevisions` property of each row will contain
the conflicts, if any, for the document.
* `TiTouchDB.QUERY_ONLY_CONFLICTS`: only documents in conflict will be returned.

**database**

[`database`](#database) object, read-only. The database where the query index is stored.

**descending**

boolean, read/write.  Should the rows be returned in descending key order? Default value is false.

**endKey**

scalar|dictionary|array, read/write.  If present, the maximum key value of the last document to return.

**endKeyDocID**

string, read/write.  The identifier of the last document to return.

**error**

dictionary, read-only.  The most-recent error that occurred in the query.

**groupLevel**

number, read/write.  If non-zero, enables grouping of results that have array keys in views that have
reduce functions.

**indexUpdateMode**

number, read/write.  Determines whether or when the view index is updated. By default, the index will
be updated if necessary before the query runs (`QUERY_UPDATE_INDEX_BEFORE`).  To get stale results and
update the index afterward, set this to `QUERY_UPDATE_INDEX_AFTER`.  To read the stale index and not
update, use `QUERY_UPDATE_INDEX_NEVER`.

**keys**

array of scalar|dictionary|array, read/write.  If set, the query will only fetch rows with the provided
keys.

**limit**

number, read/write.  The maximum number of rows to return.  Default value is 0, meaning unlimited.

**mapOnly**

boolean, read/write.  Set to true to disable the reduce function.

**prefetch**

boolean, read/write.  If true, query results will include the entire document contents of the associated
rows in the `documentContents` property.

**skip**

number, read/write.  The number of initial rows to skip. Default value is 0.  Should only be used with
small values. For efficient paging, use startKey and limit.

**startKey**

scalar|dictionary|array, read/write.  If present, the minimum key value of the first document to return.

**startKeyDocID**

string, read/write.  The identifier of the first document to return.

### Methods

**run**()

Synchronous call to get all of the results of querying the associated view.  Returns a
[`query enumerator`](#query_enumerator) object.

<a name="query_enumerator"/>
## Query Enumerator

A query enumerator holds the results of a view query.

### Properties

**count**

number, read-only. The number of rows in this view result.

**sequenceNumber**

number, read-only.  The current sequence number of the database at the time the view was
generated.

**stale**

boolean, read-only.  True if the database has changed since the view was generated.

### Methods

**getRow**(index)

* index (number): the index of the row to return

Returns the [`query row`](#query_row) object at the specified index or null if there is no row at
that index.

**next**()

Returns the next [`query row`](#query_row) object in the query results or null if no more rows are
present.  Usually called in a `while` loop.

**reset()**

Resets the enumeration so the next call to `nextRow()` will return the first row.

<a name="query_row"/>
## Query Row

An object returned by a [`query enumerator`](#query_enumerator) that holds a row's key, value, and
possibly source document.

### Properties

**conflictingRevisions**

array of revisions, read-only.  If the document is in conflict, returns an array of conflicting revisions
with the default "winning" revision in the first element.  Only present for a query created with
`createAllDocumentsQuery()` which also has its `allDocsMode` property set to `QUERY_SHOW_CONFLICTS`
or `QUERY_ONLY_CONFLICTS`.

**database**

[`database`](#database) object, read-only. The database where the query index is stored.

**documentID**

string, read-only.  The unique identifier of the document associated with this row.

**documentProperties**

dictionary, read-only.  The properties of the document this row was mapped from.  This property will
be null unless the **prefetch** property on the query was set to true.

**documentRevisionID**

string, read-only.  The revision ID of the source document.

**key**

scalar|dictionary|array, read-only.  The key for this row as emitted by the map/reduce functions.

**sequenceNumber**

integer, read-only.  The local sequence number of the associated doc/revision.
Valid only if the 'sequences' and 'prefetch' properties were set in the query; otherwise returns 0

**sourceDocumentID**

string, read-only.  The unique identifier of the document associated with this row.  It will be the same
as the **documentID** property unless the map function caused a related document to be linked by adding
an `_id` key to the emitted value; in this case **documentID** will refer to the linked document, while
**sourceDocumentID** always refers to the original document.

**value**

scalar|dictionary|array, read-only.  The value for this row as emitted by the map/reduce functions.

### Methods

**getDocument**()

Returns the [`document`](#document) object that was used to generate this row.  This will be
null if a grouping was enabled in the query because then the result rows don't correspond to individual
documents.

<a name="replication"/>
## Replication

Replicating data to and from a CouchDB database is an asynchronous process.  When you create a `replication`
object, you must ensure that it stays in scope the entire time it is running.  The easiest way to do this
is to declare your replication variable _outside_ of any event handlers or functions.

### Properties

**changesCount**

number, read-only.  The total number of changes to be processed if the task is active, else 0.

**completedChangesCount**

boolean, read-only.  True if the replication is complete.

**continuous**

boolean, read/write.  Should the replication operate continuously, copying changes as soon as the source
database is modified?  Default is false.

**createTarget**

boolean, read/write.  If true, create the target database if it doesn't already exist.  Default is false.

**docIds**

array of string, read/write.  Sets the documents to specify as part of the replication.

**filter**

string, read/write.  Path of an optional filter function to run on the source server.  Only documents for
which the function returns true are replicated.  If the filter is running on a CouchDB instance, the value
of this property looks like "designdocname/filtername".  If the filter is running in TouchDB and was 
registered using `registerFilter()`, then the property should just contain the name used to register the
filter.

**filterParams**

dictionary, read/write.  Parameters to pass to the filter function.

**headers**

dictionary, read/write. Extra HTTP headers to send in all requests to the remote server.
Should map strings (header names) to strings.

**isPull**

boolean, read-only.  If true, the replication is pulling from the remote database to the local database.

**isRunning**

boolean, read-only.  True if the replication is currently running

**lastError**

dictionary, read-only.  The most recent error during replication, if any.

**localDatabase**

[`database`](#database) object, read-only. The database where the replication is stored.

**remoteUrl**

string, read-only.  The URL of the remote database.

**status**

number, read-only.  The current mode of the replication.  One of `module.REPLICATION_MODE_STOPPED`,
`module.REPLICATION_MODE_OFFLINE`, `module.REPLICATION_MODE_IDLE`, or `module.REPLICATION_MODE_ACTIVE`.

### Methods

**restart**()

Restarts a completed or failed replication.

**setCredential**(credential)

* credential (dictionary): the credentials to use on the remote server

Sets the authentication credentials to use on the remote server.  Currently supports HTTP Basic 
authentication with a dictionary that contains the keys `user` for the username and `pass` for the password.

**start**()

Starts the replication process.

**stop**()

Stops a running replication process.

### Events

**change**

Fired when any of these properties change: {mode, running, error, completed, total}.

## Usage

See the examples on Github for usage.

## Author

Paul Mietz Egli (paul@obscure.com)

based on Couchbase Lite by Jens Alfke, Marty Schoch, Traun Leyden and others

## License

Apache License 2.0