package com.obscure.titouchdb;

import java.util.Arrays;

import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollObject;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.touchdb.TDDatabase;
import com.couchbase.touchdb.TDQueryOptions;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public abstract class CouchQueryProxy extends KrollProxy {

	protected TDDatabase	db;

	private Boolean			descending;

	private Object			endKey;

	private String			endKeyDocID;

	private Integer			groupLevel;

	private Object[]		keys;

	private Integer			limit;

	private Boolean			prefetch;

	private Integer			skip;

	private Integer			stale;

	private Object			startKey;

	private String			startKeyDocID;

	public CouchQueryProxy(TDDatabase db) {
		this.db = db;
	}

	protected TDQueryOptions constructQueryOptions() {
		TDQueryOptions result = new TDQueryOptions();
		if (descending != null) result.setDescending(descending);
		if (endKey != null) result.setEndKey(endKey);
		if (groupLevel != null) result.setGroupLevel(groupLevel);
		if (prefetch != null) result.setIncludeDocs(prefetch);
		if (limit != null) result.setLimit(limit);
		if (skip != null) result.setSkip(skip);
		if (startKey != null) result.setStartKey(startKey);

		if (keys != null && keys.length > 0) {
			result.setKeys(Arrays.asList(keys));
		}
		
		// not part of this object:
		// group
		// inclusive_end
		// startkey_docid
		// endkey_docid
		// reduce
		// stale
		// local_seq
		// update_seq

		return result;
	}

	@Kroll.getProperty(name = "endKey")
	public Object getEndKey() {
		return endKey;
	}

	@Kroll.getProperty(name = "endKeyDocID")
	public String getEndKeyDocID() {
		return endKeyDocID;
	}

	@Kroll.getProperty(name = "groupLevel")
	public int getGroupLevel() {
		return groupLevel != null ? groupLevel : 0;
	}

	@Kroll.getProperty(name = "keys")
	public Object[] getKeys() {
		return keys;
	}

	@Kroll.getProperty(name = "limit")
	public int getLimit() {
		return limit != null ? limit : 0;
	}

	@Kroll.getProperty(name = "skip")
	public int getSkip() {
		return skip != null ? skip : 0;
	}

	@Kroll.getProperty(name = "stale")
	public int getStale() {
		return stale != null ? stale : 0;
	}

	@Kroll.getProperty(name = "startKey")
	public Object getStartKey() {
		return startKey;
	}

	@Kroll.getProperty(name = "startKeyDocID")
	public String getStartKeyDocID() {
		return startKeyDocID;
	}

	@Kroll.getProperty(name = "descending")
	public boolean isDescending() {
		return descending != null ? descending : false;
	}

	@Kroll.getProperty(name = "prefetch")
	public boolean isPrefetch() {
		return prefetch != null ? prefetch : false;
	}

	public boolean isUpdateSeq() {
		return false;
	}

	@Kroll.method
	public abstract CouchQueryEnumeratorProxy rows();

	@Kroll.getProperty(name = "designDocument")
	public abstract CouchDesignDocumentProxy designDocument();

	@Kroll.setProperty(name = "descending")
	public void setDescending(boolean descending) {
		this.descending = descending;
	}

	@Kroll.setProperty(name = "endKey")
	public void setEndKey(KrollObject endKey) {
		this.endKey = endKey;
	}

	@Kroll.setProperty(name = "endKeyDocID")
	public void setEndKeyDocID(String endKeyDocID) {
		this.endKeyDocID = endKeyDocID;
	}

	@Kroll.setProperty(name = "groupLevel")
	public void setGroupLevel(int groupLevel) {
		this.groupLevel = groupLevel;
	}

	@Kroll.setProperty(name = "keys")
	public void setKeys(KrollObject[] keys) {
		this.keys = keys;
	}

	@Kroll.setProperty(name = "limit")
	public void setLimit(int limit) {
		this.limit = limit;
	}

	@Kroll.setProperty(name = "prefetch")
	public void setPrefetch(boolean prefetch) {
		this.prefetch = prefetch;
	}

	@Kroll.setProperty(name = "skip")
	public void setSkip(int skip) {
		this.skip = skip;
	}

	@Kroll.setProperty(name = "stale")
	public void setStale(int stale) {
		this.stale = stale;
	}

	@Kroll.setProperty(name = "startKey")
	public void setStartKey(KrollObject startKey) {
		this.startKey = startKey;
	}

	@Kroll.setProperty(name = "startKeyDocID")
	public void setStartKeyDocID(String startKeyDocID) {
		this.startKeyDocID = startKeyDocID;
	}

	public void setUpdateSeq(boolean updateSeq) {
		// TODO
	}

	public void start(KrollFunction callback) {
		// TODO threaded query
	}

}
