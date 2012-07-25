package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import android.util.Log;

import com.couchbase.touchdb.TDBody;
import com.couchbase.touchdb.TDDatabase;
import com.couchbase.touchdb.TDRevision;
import com.couchbase.touchdb.TDStatus;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class CouchDatabaseProxy extends KrollProxy {

	private static final String	LCAT	= "CouchDatabaseProxy";

	private TDDatabase			db;

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
		for (CouchDocumentProxy document : documents) {
			document.deleteDocument();
		}
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

	/**
	 * Bulk-writes multiple documents in one HTTP call.
	 * 
	 * @param docs
	 *            An array specifying the new properties of each item in
	 *            revisions. Each item must be a KrollDict, or null object which
	 *            means to delete the corresponding document.
	 * @param revisions
	 *            A parallel array to 'properties', containing each
	 *            CouchRevisionProxy or CouchDocumentProxy to be updated. Can be
	 *            null, in which case the method acts as described in the docs
	 *            for -putChanges:.
	 */
	@Kroll.method
	public void putChanges(KrollDict[] dicts, @Kroll.argument(optional = true) KrollProxy[] revisions) {
		if (dicts == null) {
			Log.e(LCAT, "missing documents parameter");
		}
		else if (revisions != null && dicts.length != revisions.length) {
			Log.e(LCAT, "must provide the same number of docs (" + (dicts != null ? dicts.length : 0) + ") and revisions (" + revisions.length + ")");
		}
		else {
			for (int i = 0; i < dicts.length; i++) {
				KrollDict dict = dicts[i];
				if (revisions != null) {
					if (revisions[i] instanceof CouchRevisionProxy) {
						((CouchRevisionProxy) revisions[i]).putProperties(dict);
					}
					else if (revisions[i] instanceof CouchDocumentProxy) {
						((CouchDocumentProxy) revisions[i]).putProperties(dict);
					}
					else {
						Log.e(LCAT, "invalid type in revisions array: " + (revisions[i] != null ? revisions[i].getClass().getName() : "null"));
					}
				}
				else {
					// create new docs
					if (dict == null) {
						Log.e(LCAT, "cannot delete a document without providing a revision");
					}
					else {
						TDStatus status = new TDStatus();
						TDRevision revision = new TDRevision(new TDBody(dict));
						db.putRevision(revision, revision.getRevId(), false, status);
					}
				}
			}
		}
	}

	@Kroll.method
	public CouchReplicationProxy[] replicateWithURL(String url, boolean exclusively) {
		// TODO
		return null;
	}

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
