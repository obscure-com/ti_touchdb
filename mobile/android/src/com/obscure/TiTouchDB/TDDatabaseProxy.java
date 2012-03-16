package com.obscure.TiTouchDB;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.kroll.common.Log;
import org.appcelerator.titanium.TiBlob;

import com.couchbase.touchdb.TDAttachment;
import com.couchbase.touchdb.TDDatabase;
import com.couchbase.touchdb.TDDatabase.TDContentOptions;
import com.couchbase.touchdb.TDQueryOptions;
import com.couchbase.touchdb.TDRevision;
import com.couchbase.touchdb.TDStatus;
import com.couchbase.touchdb.TDView;
import com.couchbase.touchdb.replicator.TDPusher;
import com.couchbase.touchdb.replicator.TDReplicator;

@Kroll.proxy
public class TDDatabaseProxy extends KrollProxy {

	private static final String	LCAT	= "TDDatabaseProxy";

	public static EnumSet<TDContentOptions> toContentOptions(String[] opts) {
		if (opts == null) return null;

		List<TDContentOptions> list = new ArrayList<TDContentOptions>();
		for (String str : opts) {
			list.add(TDContentOptions.valueOf(str));
		}
		return EnumSet.copyOf(list);
	}

	@SuppressWarnings("unchecked")
	public static TDQueryOptions toQueryOptions(Map<String, Object> queryOptions) {
		if (queryOptions == null) return null;

		/*
		 * TDQueryOptions has default values for all properties, so only make
		 * changes if the incoming map contains a property value.
		 */

		TDQueryOptions result = new TDQueryOptions();
		// not exactly sure what this is
		if (queryOptions.containsKey("content_options")) {
			result.setContentOptions(toContentOptions((String[]) queryOptions.get("content_options")));
		}
		if (queryOptions.containsKey("descending")) {
			result.setDescending((Boolean) queryOptions.get("descending"));
		}
		if (queryOptions.containsKey("endKey")) {
			result.setEndKey(queryOptions.get("endKey"));
		}
		if (queryOptions.containsKey("group")) {
			result.setGroup((Boolean) queryOptions.get("group"));
		}
		if (queryOptions.containsKey("groupLevel")) {
			result.setGroupLevel((Integer) queryOptions.get("groupLevel"));
		}
		if (queryOptions.containsKey("includeDocs")) {
			result.setIncludeDocs((Boolean) queryOptions.get("includeDocs"));
		}
		if (queryOptions.containsKey("inclusiveEnd")) {
			result.setInclusiveEnd((Boolean) queryOptions.get("inclusiveEnd"));
		}
		if (queryOptions.containsKey("keys")) {
			result.setKeys((List<Object>) queryOptions.get("keys"));
		}
		if (queryOptions.containsKey("limit")) {
			result.setLimit((Integer) queryOptions.get("limit"));
		}
		if (queryOptions.containsKey("reduce")) {
			result.setReduce((Boolean) queryOptions.get("reduce"));
		}
		if (queryOptions.containsKey("skip")) {
			result.setSkip((Integer) queryOptions.get("skip"));
		}
		if (queryOptions.containsKey("startKey")) {
			result.setStartKey(queryOptions.get("startKey"));
		}
		if (queryOptions.containsKey("updateSeq")) {
			result.setUpdateSeq((Boolean) queryOptions.get("updateSeq"));
		}
		return result;
	}

	private TDDatabase	database;

	public TDDatabaseProxy(TDDatabase database) {
		this.database = database;
	}

	@Kroll.method
	public boolean beginTransaction() {
		return database.beginTransaction();
	}

	@Kroll.method
	public boolean close() {
		return database.close();
	}

	@Kroll.method
	public TDRevisionProxy createRevision(KrollDict properties) {
		if (properties == null) return null;
		return new TDRevisionProxy(new TDRevision(properties));
	}

	@Kroll.method
	public boolean deleteDatabase() {
		return database.deleteDatabase();
	}

	@Kroll.method
	public int deleteRevision(TDRevisionProxy proxy) {
		if (proxy == null || proxy.getRevision() == null) return TDStatus.BAD_REQUEST;

		TDStatus status = new TDStatus();
		TDRevision rev = proxy.getRevision();
		rev.setDeleted(true);
		database.putRevision(rev, rev.getRevId(), true, status);
		return status.getCode();
	}

	@Kroll.getProperty
	public int documentCount() {
		return database.getDocumentCount();
	}

	@Kroll.method
	public boolean endTransaction(@Kroll.argument(optional = true) Boolean commit) {
		return database.endTransaction(commit != null ? commit.booleanValue() : true);
	}

	@Kroll.getProperty
	public boolean exists() {
		return database.exists();
	}

	@Kroll.method
	public boolean existsDocument(String docID, @Kroll.argument(optional = true) String revID) {
		return database.existsDocumentWithIDAndRev(docID, revID);
	}

	@Kroll.method
	public String generateDocumentID() {
		return TDDatabase.generateDocumentId();
	}

	@Kroll.method
	public KrollDict getAllDocs(@Kroll.argument(optional = true) KrollDict queryOptions) {
		TDQueryOptions options = toQueryOptions(queryOptions);
		return (KrollDict) TitouchdbModule.krollify(database.getAllDocs(options));
	}

	@Kroll.method
	public TiBlob getAttachmentForSequence(long sequence, String filename) {
		TDStatus status = null;
		TDAttachment att = database.getAttachmentForSequence(sequence, filename, status);
		return att != null ? TiBlob.blobFromData(att.getData(), att.getContentType()) : null;
	}

	public TDDatabase getDatabase() {
		return database;
	}

	@Kroll.method
	public KrollDict getDocsWithIDs(String[] docIDs, KrollDict queryOptions) {
		Map<String,Object> result = database.getDocsWithIDs(Arrays.asList(docIDs), toQueryOptions(queryOptions));
		return (KrollDict) TitouchdbModule.krollify(result);
	}

	@Kroll.method
	public TDRevisionProxy getDocument(String docID, @Kroll.argument(optional = true) String revID, @Kroll.argument(optional = true) String[] contentOptions) {
		TDRevision doc = database.getDocumentWithIDAndRev(docID, revID, toContentOptions(contentOptions));
		return doc != null ? new TDRevisionProxy(doc) : null;
	}

	@Kroll.getProperty
	public String getName() {
		return database.getName();
	}

	@Kroll.getProperty
	public String getPath() {
		return database.getPath();
	}

	@Kroll.method
	public List<TDRevisionProxy> getRevisionHistory(TDRevisionProxy proxy) {
		List<TDRevision> revs = database.getRevisionHistory(proxy.getRevision());
		List<TDRevisionProxy> result = new ArrayList<TDRevisionProxy>();
		for (TDRevision rev : revs) {
			result.add(new TDRevisionProxy(rev));
		}
		return result;
	}

	@Kroll.method
	public boolean isValidDocumentID(String docID) {
		return TDDatabase.isValidDocumentId(docID);
	}

	@Kroll.getProperty
	public long lastSequence() {
		return database.getLastSequence();
	}

	@Kroll.method
	public boolean open() {
		try {
			return database.open();
		}
		catch (Throwable t) {
			Log.e(LCAT, "open error", t);
		}
		return false;
	}

	@Kroll.getProperty
	public String privateUUID() {
		return database.privateUUID();
	}

	@Kroll.getProperty
	public String publicUUID() {
		return database.publicUUID();
	}

	@Kroll.method
	public int putRevision(TDRevisionProxy proxy, @Kroll.argument(optional = true) String prevRevID, @Kroll.argument(optional = true) Boolean allowConflict) {
		if (proxy == null) return TDStatus.BAD_REQUEST;

		TDStatus status = new TDStatus();

		TDRevision rev = proxy.getRevision();
		if (rev == null) {
			return TDStatus.BAD_REQUEST;
		}
		if (rev.getDocId() == null) {
			rev.setDocId((String) rev.getProperties().get("_id"));
		}

		TDRevision newrev = database.putRevision(rev, prevRevID, allowConflict != null ? allowConflict : false, status);
		proxy.setRevision(newrev);
		return status.getCode();
	}

	@Kroll.method
	public int replicateDatabase(String remote, @Kroll.argument(optional = true) Boolean push, @Kroll.argument(optional = true) KrollDict options) {
		boolean continuous = false, cancel = false, createTarget = false;
		if (options != null) {
			continuous = options.containsKey("continuous") ? (Boolean) options.get("continuous") : false;
			cancel = options.containsKey("cancel") ? (Boolean) options.get("cancel") : false;
			createTarget = options.containsKey("createTarget") ? (Boolean) options.get("createTarget") : false;
		}

		URL url = null;
		try {
			url = new URL(remote);
		}
		catch (MalformedURLException e) {
			Log.e(LCAT, e.getMessage());
			return TDStatus.BAD_REQUEST;
		}

		if (!cancel) {
			TDReplicator repl = database.getReplicator(url, push != null ? push : false, continuous);
			if (repl == null) return TDStatus.INTERNAL_SERVER_ERROR;

			if (repl.isPush()) {
				((TDPusher) repl).setCreateTarget(createTarget);
			}

			// TODO filters

			repl.start();
		}
		else {
			TDReplicator repl = database.getActiveReplicator(url, push);
			if (repl == null) {
				return TDStatus.NOT_FOUND;
			}
			repl.stop();
		}

		return TDStatus.OK;
	}

	public void setDatabase(TDDatabase database) {
		this.database = database;
	}

	@Kroll.getProperty
	public long totalDataSize() {
		return database.totalDataSize();
	}

	@Kroll.method
	public int updateAttachment(String name, TiBlob blob, String contentType, String docID, String revID) {
		TDStatus status = new TDStatus();
		database.updateAttachment(name, blob.getBytes(), contentType, docID, revID, status);
		return status.getCode();
	}

	@Kroll.method
	public TDViewProxy viewNamed(String name) {
		TDView view = database.getViewNamed(name);
		return new TDViewProxy(view);
	}
}
