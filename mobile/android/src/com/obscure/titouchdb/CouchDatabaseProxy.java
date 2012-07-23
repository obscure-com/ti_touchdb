package com.obscure.titouchdb;

import java.util.Map;

import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.touchdb.TDDatabase;
import com.couchbase.touchdb.TDRevision;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class CouchDatabaseProxy extends KrollProxy {

	private TDDatabase								db;

	public CouchDatabaseProxy(TDDatabase db) {
		this.db = db;
	}

	@Kroll.method
	public void clearDocumentCache() {
		// noop on Android
	}

	@Kroll.method
	public void compact() {
		db.compact();
	}

	@Kroll.method
	public void create() {
		db.open();
	}

	@Kroll.method
	public void deleteDatabase() {
		db.deleteDatabase();
	}

	@Kroll.method
	public void deleteDocuments(CouchDocumentProxy[] documents) {
		// TODO
	}

	@Kroll.method
	public void deleteRevisions(CouchRevisionProxy[] revisions) {
		// TODO
	}

	@Kroll.method
	public CouchDesignDocumentProxy designDocumentWithName(String name) {
		// TODO
		return null;
	}
	
	@Kroll.method
	public CouchDocumentProxy documentWithID(String id) {
		TDRevision doc = db.getDocumentWithIDAndRev(id, null, Constants.EMPTY_CONTENT_OPTIONS);
		return doc != null ? new CouchDocumentProxy(db, doc) : null;
	}
	
	@Kroll.method
	public boolean ensureCreated() {
		if (!db.exists()) {
			db.open();
		}
		return db.exists();
	}
	
	@Kroll.method
	public CouchQueryProxy getAllDocuments() {
		return new AllDocumentsCouchQueryProxy(db);
	}
		
	@Kroll.method
	public int getDocumentCount() {
		return db.getDocumentCount();
	}
	
	@Kroll.method
	public CouchQueryProxy getDocumentsWithIDs(String[] ids) {
		// TODO
		return null;
	}
	
	@Kroll.getProperty(name = "relativePath")
	public String getRelativePath() {
		return db.getPath();
	}
	
	@Kroll.method
	public long lastSequenceNumber() {
		return db.getLastSequence();
	}
	
	// QUERIES AND DESIGN DOCUMENTS
	
	@Kroll.method
	public CouchReplicationProxy pullFromDatabaseAtURL(String url) {
		// TODO
		return null;
	}
	
	@Kroll.method
	public CouchReplicationProxy pushToDatabaseAtURL(String url) {
		// TODO
		return null;
	}
	
	// CHANGE TRACKING
	
	@Kroll.method
	public void putChanges(Map<String,Object>[] docs, Object[] revisions) {
		// TODO
	}
	
	@Kroll.method
	public CouchReplicationProxy[] replicateWithURL(String url, boolean exclusively) {
		// TODO
		return null;
	}
	
	// REPLICATION AND SYNCHRONIZATION
	
	@Kroll.method
	public CouchPersistentReplicationProxy replicationFromDatabaseAtURL(String url) {
		// TODO
		return null;
	}
	
	@Kroll.method
	public CouchPersistentReplicationProxy[] replications() {
		// TODO
		return null;
	}
	
	@Kroll.method
	public CouchPersistentReplicationProxy replicationToDatabaseAtURL(String url) {
		// TODO
		return null;
	}

	@Kroll.method
	public CouchQueryProxy slowQuery(String mapSource, String reduceSource, String language) {
		throw new UnsupportedOperationException("slowQuery not supported on Android");
	}
	
	@Kroll.method
	public boolean tracksChanges() {
		// TODO is this in Android?
		return false;
	}
	
	@Kroll.method
	public CouchDocumentProxy untitledDocument() {
		return new CouchDocumentProxy(db, null);
	}
}
