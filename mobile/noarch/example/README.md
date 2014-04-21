## Test Notes

### Do not modify the `elements` database

The `elements` database is a predefined db that is used to test database loading,
queries, and attachment methods.  Many of the query properties depend on this database
being in a specific state.  Normally, reloading the database from a file would be
enough to restore state, but when building a test app from the `example` directory,
the database file is actually a symlink, so deleting and reinstalling doesn't reset
the entire db contents.

### Replication tests

The replication tests require a CouchDB server