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

### Constants

#### Replication Mode

* REPLICATION\_MODE\_STOPPED
* REPLICATION\_MODE\_OFFLINE
* REPLICATION\_MODE\_IDLE
* REPLICATION\_MODE\_ACTIVE

#### Stale queries

* STALE\_QUERY\_NEVER
* STALE\_QUERY\_OK
* STALE\_QUERY\_UPDATE\_AFTER


<a name="databaseManager"/>
## DatabaseManager

Applications interact with the various TiTouchDB databases using the Database Manager.

### Properties

**allDatabaseNames**

array of strings, read-only.  Return the names of all existing databases.

**error**

dictionary, read-only.  The most-recent error that occurred in the database manager.

**internalURL**

string, read-only.  The internal URL of the database manager.  This can be used to construct
URLs for internal replication.

### Methods

**createDatabaseNamed**(name)

* name (string): the name of the `database` to create.

Returns the [`database`](#database) with the given name, creating it if it didn't already exist.
Multiple calls with the same name will return the same object instance.
NOTE: Database names may not contain capital letters and may not start with an underscore!

**databaseNamed**(name)

* name (string): the name of the `database` to return.

Return the [`database`](#database) with the specified name.  If the database manager does not have a database with
the provided name, returns null.  Multiple calls with the same name will return the same object instance.

**installDatabase**(name, pathToDatabase, pathToAttachments)

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

### Properties

**documentCount**

integer, read-only.  The number of documents in the database.

**error**

dictionary, read-only.  The most-recent error that occurred in the database.

**lastSequenceNumber**

integer, read-only. The latest sequence number used.  Every new revision is assigned a new sequence number,
so this property increases monotonically as changes are made to the database. It can be used to check whether
the database has changed between two points in time.

**name**

string, read-only.  The database's name.


### Methods

**cachedDocumentWithID**(docid)

* docid (string): the unique ID of the document

Fetch an already-instantiated [`document`](#document) object with the given ID, or null if none is yet cached.

**clearDocumentCache**()

Empties the cache of recently used document objects. API calls will now instantiate and return new instances.

**compact**()

Compacts the database, freeing up disk space by deleting old revisions of documents.  This should be
run periodically, especially after making a lot of changes.  The compact operation is asynchronous.

**defineFilter**(name, filter)

* name (string): the name of the filter function
* filter (function(rev, params)): the filter function, return true to replicate the revision. Set this
  argument to null to remove the named filter function.
    * rev: the revision object to be validated
    * params: the filter params (currently null)

Defines or clears a named filter function. Filters are used by push replications to choose which documents to send.

**defineValidation**(name, validate)

* name (string): the name of the validation function
* validate (function(rev, context)): the validation function, return true to accept revision. Set this
  argument to null to remove the named validation function.
    * rev: the revision object to be validated
    * context: the validation context (currently null)

Defines or clears a named document validation function. Before any change to the database, all registered
validation functions are called and given a chance to reject it. (This includes incoming changes from a
pull replication.)

**deleteDatabase**()

Permanently remove this database and all associated data.

**documentWithID**(docid)

* docid (string): the unique ID of the document

Fetch a [`document`](#document) object from the database by its identifier or create a new document with
the provided identifier if it doesn't already exist.  Note that the new document is not saved until a call to
**putProperties**() is made.

**pullFromURL**(url)

* url (string): the URL of the database to pull from

Set up a one-time replication from a source database to this database and return a [`replication`](#replication)
object.  The returned object can be customized prior to the start of replication.

**pushToURL**(url)

* url (string): the URL of the database to push to

Set up a one-time replication from this database to a remote target database and return a [`replication`](#replication)
object.  The returned object can be customized prior to the start of replication.

**queryAllDocuments**()

Returns a [`query`](#query) that matches all documents in the database.
This is like querying an imaginary view that emits every document's ID as a key.

**replicateWithURL**(url, exclusively)

* url (string): the URL of the database to replicate with
* exclusively (boolean): if true, any existing replications with this URL will be removed

Convenience function for setting up two-way replication with a remote database specified by the provided
URL.  Returns an array containing the push [`replication`](#replication)
object and the pull [`replication`](#replication) object, or null on failure.

**slowQueryWithMap**(map)

* map (string): map function source in JavaScript

Returns a [`query`](#query) object that runs an arbitrary map.  This is the equivalent of a CouchDB
temporary view, and as such is very slow compared to a precompiled view.  It may be useful during
development, but in general this is inefficient if this map will be used more than once,
because the entire view has to be regenerated from scratch every time.

**untitledDocument**()

Create a new [`document`](#document) object with a generated identifier.  The identifier *cannot* be
changed after creation; use **documentWithID(id)** to create a document that has a specific identifier.

**viewNamed**(name)

* name (string): the name of the view to fetch

Returns a [`view`](#view) object with the given name. (This succeeds even if the view doesn't
already exist, but the view won't be added to the database until it is assigned a map function.)

### Events

**change**: fired when modifications are made to the documents in the database.

<a name="document"/>
## Document

A document is a JSON object consisting of arbitrary key-value pairs.  Each document in a database
has a unique identifier and may be fetched using this ID or located as part of a query on a view
object.  Document properties that begin with an underscore are reserved.

### Properties

**abbreviatedID**

string, read-only. The document ID abbreviated to a maximum of 10 characters including ".." in the middle.
Useful for logging or debugging.

**currentRevision**

[`revision`](#revision), read-only.  The current/latest revision. This object is cached

**currentRevisionID**

string, read-only.  The ID of the current revision.  If not known, returns null.

**documentID**

string, read-only. The unique ID of this document; its key in the database.

**error**

dictionary, read-only.  The most-recent error that occurred in the document.

**isDeleted**

boolean, read-only.  True if the document has been deleted from the database.

**properties**

dictionary, read-only

The contents of the current revision of the document; shorthand for `doc.currentRevision.properties`.
Any keys in the returned dictionary that start with an underscore are TouchDB metadata.

**userProperties**

dictionary, read-only

The value of `properties` with all of the reserved keys removed.


### Methods

**deleteDocument**()

Mark the document as deleted from the database.  The next time the database is compacted, the document
will be permanently deleted.

**getLeafRevisions**()

Returns an array of leaf [`revision`](#revision) objects in the document's revision tree,
including deleted revisions (i.e. previously-resolved conflicts.)

**getRevisionHistory**()

Returns an array of available [`revision`](#revision) objects.  The ordering is essentially arbitrary,
but usually chronological unless there has been merging with changes from another server. The number of
historical revisions available may vary; it depends on how recently the database has been compacted.
You should not rely on earlier revisions being available, except for those representing unresolved conflicts.

**newRevision**()

Creates an unsaved new [`revision`](#revision) whose parent is the current revision,
or which will be the first revision if the document doesn't exist yet.
You can modify this revision's properties and attachments, then save it.
No change is made to the database until/unless you save the new revision.

**propertyForKey**(key)

* key (string): the key of the property in the document to return.

Return the value of the document property specified by the `key` argument.

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

**revisionWithID**(revisionId)

* revisionId (string): the identifier of the revision to fetch

Returns the [`revision`](#revision) object with the specified ID or null if no revision with the
ID is present in the document.


### Events

**change**: fired when modifications are made to the document.


<a name="attachment"/>
## Attachment

Documents may contain zero or more binary attachments of any type.  Attachments are opaque data; they
cannot be queried with view functions.

### Properties

**body**

Titanium.Blob, read-only.  The body data of the attachment.

**bodyURL**

string, read-only.  A file URL pointing to the attachment contents.

**contentType**

string, read-only.  The MIME type of the attachment.

**error**

dictionary, read-only.  The most-recent error that occurred in the attachment.

**length**

number, read-only.  The length of the attachment in bytes.

**metadata**

dictionary, read-only.  The CouchDB metadata for the attachment.

**name**

string, read-only.  The filename of the attachment (the final URL path component).


### Methods

**updateBody**()

Updates the body, creating a new document revision in the process.  Returns the new [`revision`](#revision)
object.

<a name="revision"/>
## Revision

A revision is a version of a document stored in the database.  Each time changes are made to a document --
for example, through a call to `putProperties()` or by adding a new attachment -- a new revision of that
document is created.  Revisions are used to coordinate changes that come from multiple sources and to 
determine if incoming changes will result in a conflict in the document contents.  Revisions are *not* a
version control system for your documents, however, as they can be permanently removed by a database
`compact` operation.

In TiTouchDB, there are two types of revision objects: existing revisions that have been persisted into
the database and new revisions that are returned by the `newRevision()` method on the `database` and
existing revision objects.  Think of new revision objects as scratchpads where you can add properties and
attachments in multiple steps prior to saving.

TODO maybe split out the docs for new revisions and existing revisions.

### Properties

**attachmentNames**

array of strings, read-only. The names of all attachments on this revision.

**attachments**

array of [`attachment`](#attachment) objects, read-only. All attachments on this revision.

**error**

dictionary, read-only.  The most-recent error that occurred in the revision.

**isDeleted**

boolean, read-only for existing revisions; read-write for new revisions.  True if this revision marks
the deletion of a document from the database.

**parentRevision**

dictionary, read-only.  The previous revision object in this document's local history (new revision only).

**parentRevisionID**

string, read-only.  The identifier previous revision object in this document's local history (new revision only).

**properties**

dictionary, read-only for existing revisions; read-write for new revisions. The contents of the revision.
Any keys in the returned dictionary that start with an underscore are reserved.  Revision properties are
cached for the lifespan of the object.

**revisionID**

string, read-only.  The unique identifier of the revision (the CouchDB "_rev" property).

**userProperties**

dictionary, read-only. The contents of the revision without the ones reserved for the database.

### Methods

**addAttachment**(name, contentType, content)

* name (string): the name of the new attachment
* contentType (string): the MIME type of the new attachment
* content (TiBlob): the attachment content

Creates a new attachment object with the specified name, MIME type, and content.  The attachment
data will be written to the database when the revision is saved (new revision only).

**attachmentNamed**(name)

* name (string): the name of the attachment to fetch

Returns the [`attachment`](#attachment) object with the specified name or null if the attachment does
not exist.

**deleteDocument**()

Deletes the document by creating a new deletion-marker revision (existing revisions only).

**getRevisionHistory**()

Returns the history of this document as an array of revisions, in forward order. Older revisions are
NOT guaranteed to have their properties available (existing revisions only).

**newRevision**()

Create a new, unsaved revision object for this revision's document (existing revisions only).

**propertyForKey**(key)

* key (string): key of the property to return

Returns the revision property for the specified key.

**putProperties**(properties)

* properties (dictionary): the properties to write to the new revision.

Creates a new revision for this revision's document with the provided properties (existing revision
only).

**removeAttachment**(name)

* name (string): the name of the attachment to remove

Deletes any existing attachment with the given name.  The attachment will be deleted from the
database when the revision is saved (new revisions only).

**setPropertyForKey**(key, value)

* key (string): key of the property to set
* value (object): the value of the property to set

Set a property on the revision corresponding to the specified key (new revision only).

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

**name**

string, read-only.  The name of the view.

### Methods

**query**()

Return a [`query`](#query) object that can be used to fetch the keys, values, and documents from this
view's index.

**setMap**(map)

* map (function(document)): the map function for this view

Set the map function for the view.  Calling setMap(null) will delete the view.

**setMapAndReduce**(map, reduce)

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

**keys**

array of scalar|dictionary|array, read/write.  If set, the query will only fetch rows with the provided
keys.

**limit**

number, read/write.  The maximum number of rows to return.  Default value is 0, meaning unlimited.

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

**stale**

number, read/write.  If set, allows faster results at the expense of returning possibly out-of-date
data.  One of `module.STALE_QUERY_NEVER`, `module.STALE_QUERY_OK`, or `module.STALE_QUERY_UPDATE_AFTER`.

### Methods

**rows**()

Synchronous call to get all of the results of querying the associated view.  Returns a
[`query enumerator`](#query_enumerator) object.

**rowsIfChanged**()

Same as `rows()`, except returns null if the query results have not changed since the last time it
was evaluated

<a name="query_enumerator"/>
## Query Enumerator

A query enumerator holds the results of a view query.

### Properties

**count**

number, read-only. The number of rows in this view result.

**sequenceNumber**

number, read-only.  The current sequence number of the database at the time the view was
generated.

### Methods

**nextRow**()

Returns the next [`query row`](#query_row) object in the query results or null if no more rows are
present.  Usually called in a `while` loop.

**rowAtIndex**(index)

* index (number): the index of the row to return

Returns the [`query row`](#query_row) object at the specified index or null if there is no row at
that index.

<a name="query_row"/>
## Query Row

An object returned by a [`query enumerator`](#query_enumerator) that holds a row's key, value, and
possibly source document.

### Properties

**document**

[`document`](#document) object, read-only.  The document that was used to generate this row.  This will be
null if a grouping was enabled in the query because then the result rows don't correspond to individual
documents.

**documentID**

string, read-only.  The unique identifier of the document associated with this row.

**documentProperties**

dictionary, read-only.  The properties of the document this row was mapped from.  This property will
be null unless the **prefetch** property on the query was set to true.

**documentRevision**

string, read-only.  The revision ID of the source document.

**key**

scalar|dictionary|array, read-only.  The key for this row as emitted by the map/reduce functions.

**key0**

scalar|dictionary|array, read-only.  Shorthand for the first element in an array key (see `keyAtIndex()`).

**key1**

scalar|dictionary|array, read-only.  Shorthand for the second element in an array key (see `keyAtIndex()`).

**key2**

scalar|dictionary|array, read-only.  Shorthand for the third element in an array key (see `keyAtIndex()`).

**key3**

scalar|dictionary|array, read-only.  Shorthand for the fourth element in an array key (see `keyAtIndex()`).

**localSequence**

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

**completed**

boolean, read-only.  True if the replication is complete.

**continuous**

boolean, read/write.  Should the replication operate continuously, copying changes as soon as the source
database is modified?  Default is false.

**createTarget**

boolean, read/write.  If true, create the target database if it doesn't already exist.  Default is false.

**doc_ids**

array of string, read/write.  Sets the documents to specify as part of the replication.

**error**

dictionary, read-only.  The most recent error during replication, if any.

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

**mode**

number, read-only.  The current mode of the replication.  One of `module.REPLICATION_MODE_STOPPED`,
`module.REPLICATION_MODE_OFFLINE`, `module.REPLICATION_MODE_IDLE`, or `module.REPLICATION_MODE_ACTIVE`.

**persistent**

boolean, read/write.  Is this replication remembered persistently in the _replicator database?
Persistent continuous replications will automatically restart on the next launch
or when the app returns to the foreground.

**pull**

boolean, read-only.  If true, the replication is pulling from the remote database to the local database.

**remoteURL**

string, read-only.  The URL of the remote database.

**running**

boolean, read-only.  True if the replication is currently running.

**total**

number, read-only.  The total number of changes to be processed if the task is active, else 0.

### Methods

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