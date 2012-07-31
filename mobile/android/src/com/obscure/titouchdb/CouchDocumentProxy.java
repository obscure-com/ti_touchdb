package com.obscure.titouchdb;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import android.util.Log;

import com.couchbase.touchdb.TDAttachment;
import com.couchbase.touchdb.TDBody;
import com.couchbase.touchdb.TDDatabase;
import com.couchbase.touchdb.TDRevision;
import com.couchbase.touchdb.TDRevisionList;
import com.couchbase.touchdb.TDStatus;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class CouchDocumentProxy extends KrollProxy {

	private static final String	LCAT	= "CouchDocumentProxy";

	protected TDRevision			currentRevision;

	protected TDDatabase			db;

	private CouchRevisionProxy	currentRevisionProxy;

	public CouchDocumentProxy(TDDatabase db, TDRevision rev) {
		assert db != null;
		this.db = db;
		this.currentRevision = rev;
	}

	@Kroll.getProperty(name = "abbreviatedID")
	public String abbreviatedID() {
		String id = currentRevision != null ? currentRevision.getDocId() : null;
		return id != null ? id.substring(0, 10) : null;
	}

	@Kroll.getProperty(name = "currentRevision")
	public CouchRevisionProxy currentRevision() {
		if (currentRevision != null && currentRevisionProxy == null) {
			currentRevisionProxy = new CouchRevisionProxy(this, currentRevision);
		}
		return currentRevisionProxy;
	}

	@Kroll.getProperty(name = "currentRevisionID")
	public String currentRevisionID() {
		return currentRevision != null ? currentRevision.getRevId() : null;
	}

	@Kroll.method
	public void deleteDocument() {
		if (currentRevision != null) {
			currentRevision.setDeleted(true);
			saveRevision(currentRevision);
		}
	}

	@Kroll.getProperty(name = "documentID")
	public String documentID() {
		return currentRevision != null ? currentRevision.getDocId() : null;
	}

	// REVISIONS

	@Kroll.method
	public CouchRevisionProxy[] getConflictingRevisions() {
		CouchRevisionProxy[] result = new CouchRevisionProxy[0];
		if (currentRevision != null) {
			List<String> ids = db.getConflictingRevisionIDsOfDocID(currentRevision.getDocId());
			if (ids == null) return null;
			List<CouchRevisionProxy> proxies = new ArrayList<CouchRevisionProxy>(ids.size());
			for (String id : ids) {
				proxies.add(new CouchRevisionProxy(this, db.getDocumentWithIDAndRev(currentRevision.getDocId(), id, Constants.EMPTY_CONTENT_OPTIONS)));
			}
			result = proxies.toArray(new CouchRevisionProxy[0]);
		}
		return result;
	}

	@Kroll.method
	public CouchRevisionProxy[] getRevisionHistory() {
		CouchRevisionProxy[] result = new CouchRevisionProxy[0];

		if (currentRevision != null) {
			// returns revisions in descending order
			TDRevisionList list = db.getAllRevisionsOfDocumentID(currentRevision.getDocId(), false);
			if (list != null) {
				list.sortBySequence();
				List<CouchRevisionProxy> proxies = new ArrayList<CouchRevisionProxy>(list.size());
				for (TDRevision rev : list) {
					proxies.add(new CouchRevisionProxy(this, rev));
				}
				result = proxies.toArray(new CouchRevisionProxy[0]);
			}
		}

		return result;
	}

	@Kroll.getProperty(name = "isDeleted")
	public boolean isDeleted() {
		return currentRevision != null ? currentRevision.isDeleted() : true;
	}

	@Kroll.getProperty(name = "properties")
	public KrollDict properties() {
		if (currentRevision != null && currentRevision.getProperties() != null) {
			return new KrollDict(currentRevision.getProperties());
		}
		else {
			return new KrollDict();
		}
	}

	// DOCUMENT PROPERTIES

	@Kroll.method
	public void putProperties(KrollDict props) {
		putPropertiesForRevisionID(currentRevision != null ? currentRevision.getRevId() : null, props);
	}

	protected void putPropertiesForRevisionID(String revid, KrollDict props) {
		TDRevision rev = new TDRevision(documentID(), revid, false);
		rev.setBody(new TDBody(props));
		saveRevision(rev);
	}

	private void saveRevision(TDRevision rev) {
		TDStatus status = new TDStatus();
		TDRevision stub = db.putRevision(rev, rev.getRevId(), false, status);

		// the object returned by putRevision() is NOT the new revision -- it's
		// a stub with the (possibly new) document ID and revision number that
		// were passed in. Need to re-select the current revision (revid of
		// null) to get the full TDRevision back.
		if (status.getCode() == TDStatus.OK || status.getCode() == TDStatus.CREATED) {
			currentRevision = loadRevision(stub.getDocId(), stub.getRevId());
			currentRevisionProxy = null;
		}
	}

	protected TDRevision loadRevision(String docid, String revid) {
		return db.getDocumentWithIDAndRev(docid, revid, Constants.EMPTY_CONTENT_OPTIONS);
	}

	@Kroll.method
	public boolean resolveConflictingRevisions(CouchRevisionProxy conflicts, Object resolution) {
		// can be Map<String,Object> or CouchRevisionProxy
		// TODO
		return false;
	}

	@Kroll.method
	public CouchRevisionProxy revisionWithID(String revid) {
		if (currentRevision == null || currentRevision.getDocId() == null) {
			return null;
		}

		TDRevision rev = db.getDocumentWithIDAndRev(currentRevision.getDocId(), revid, Constants.EMPTY_CONTENT_OPTIONS);
		return rev != null ? new CouchRevisionProxy(this, rev) : null;
	}

	protected String relativePath() {
		return currentRevision != null ? String.format("/%s/%s", db.getName(), currentRevision.getDocId()) : null;
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

	protected void saveAttachment(TDAttachment attachment, String filename) {
		if (currentRevision == null || currentRevision.getDocId() == null) {
			Log.e(LCAT, "cannot add attachment to unsaved document");
			return;
		}
		TDStatus status = new TDStatus();
		TDRevision stub = db.updateAttachment(filename, attachment.getData(), attachment.getContentType(), currentRevision.getDocId(),
				currentRevision.getRevId(), status);
		if (status.getCode() == TDStatus.OK || status.getCode() == TDStatus.CREATED) {
			currentRevision = loadRevision(stub.getDocId(), stub.getRevId());
			currentRevisionProxy = null;
		}
	}

	protected TDAttachment attachmentNamed(String name) {
		TDStatus status = new TDStatus();
		TDAttachment result = db.getAttachmentForSequence(currentRevision.getSequence(), name, status);
		return status.getCode() == TDStatus.OK ? result : null;
	}

	protected List<String> attachmentNames() {
		if (currentRevision == null) return null;

		Map<String, Object> dict = db.getAttachmentsDictForSequenceWithContent(currentRevision.getSequence(), false);
		if (dict == null) return null;

		List<String> result = new ArrayList<String>(dict.size());
		for (String key : dict.keySet()) {
			result.add(key);
		}

		return result;
	}

}
