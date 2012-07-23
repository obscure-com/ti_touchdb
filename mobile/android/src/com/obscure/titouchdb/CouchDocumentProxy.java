package com.obscure.titouchdb;

import java.util.EnumSet;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.touchdb.TDBody;
import com.couchbase.touchdb.TDDatabase;
import com.couchbase.touchdb.TDDatabase.TDContentOptions;
import com.couchbase.touchdb.TDRevision;
import com.couchbase.touchdb.TDStatus;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class CouchDocumentProxy extends KrollProxy {

	private static final EnumSet<TDContentOptions>	EMPTY_CONTENT_OPTIONS	= EnumSet.noneOf(TDDatabase.TDContentOptions.class);

	private static final String	LCAT	= "CouchDocumentProxy";

	private TDRevision			currentRevision;

	private TDDatabase			db;

	public CouchDocumentProxy(TDDatabase db, TDRevision rev) {
		assert db != null;
		this.db = db;
		this.currentRevision = rev;
	}

	@Kroll.getProperty(name = "documentID")
	public String documentID() {
		return currentRevision != null ? currentRevision.getDocId() : null;
	}

	@Kroll.getProperty(name = "abbreviatedID")
	public String abbreviatedID() {
		String id = currentRevision != null ? currentRevision.getDocId() : null;
		return id != null ? id.substring(0, 10) : null;
	}

	@Kroll.getProperty(name = "isDeleted")
	public boolean isDeleted() {
		return currentRevision != null ? currentRevision.isDeleted() : false;
	}

	@Kroll.method
	public void deleteDocument() {
		if (currentRevision != null) {
			currentRevision.setDeleted(true);
		}
	}

	// REVISIONS

	@Kroll.getProperty(name = "currentRevisionID")
	public String currentRevisionID() {
		return currentRevision != null ? currentRevision.getRevId() : null;
	}

	@Kroll.getProperty(name = "currentRevision")
	public CouchRevisionProxy currentRevision() {
		return currentRevision != null ? new CouchRevisionProxy(currentRevision) : null;
	}

	@Kroll.method
	public CouchRevisionProxy revisionWithID(String revid) {
		// TODO
		return null;
	}

	@Kroll.method
	public CouchRevisionProxy[] getRevisionHistory() {
		// TODO
		return null;
	}

	// DOCUMENT PROPERTIES

	@Kroll.getProperty(name = "properties")
	public KrollDict properties() {
		if (currentRevision != null && currentRevision.getProperties() != null) {
			return new KrollDict(currentRevision.getProperties());
		}
		else {
			return new KrollDict();
		}
	}

	@Kroll.getProperty(name = "userProperties")
	public KrollDict userProperties() {
		KrollDict result = new KrollDict();
		KrollDict props = this.properties();
		for (String key : props.keySet()) {
			if (!key.startsWith("_")) {
				result.put(key, props.get(key));
			}
		}
		return result;
	}

	@Kroll.method
	public void putProperties(KrollDict props) {
		String prevRevId = this.currentRevisionID();
		TDRevision rev = new TDRevision(new TDBody(props));
		
		TDStatus status = new TDStatus();
		TDRevision revstub = db.putRevision(rev, prevRevId, false, status);
		
		if (status.getCode() == TDStatus.OK || status.getCode() == TDStatus.CREATED) {
			// the unit tests re-fetch the document instead of using the object
			// returned by putRevision().
			this.currentRevision = db.getDocumentWithIDAndRev(revstub.getDocId(), revstub.getRevId(), EMPTY_CONTENT_OPTIONS);
		}
	}

	// CONFLICTS

	@Kroll.method
	public CouchRevisionProxy[] getConflictingRevisions() {
		// TODO
		return null;
	}

	@Kroll.method
	public boolean resolveConflictingRevisions(CouchRevisionProxy conflicts, Object resolution) {
		// can be Map<String,Object> or CouchRevisionProxy
		// TODO
		return false;
	}

}
