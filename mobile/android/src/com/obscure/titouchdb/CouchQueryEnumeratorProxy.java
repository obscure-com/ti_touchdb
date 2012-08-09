package com.obscure.titouchdb;

import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.touchdb.TDDatabase;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class CouchQueryEnumeratorProxy extends KrollProxy implements Iterator<CouchQueryRowProxy> {

	private static final String			LCAT	= "CouchQueryEnumeratorProxy";

	private TDDatabase					db;

	Iterator<Map<String, Object>>		iterator;

	private int							offset;

	private List<Map<String, Object>>	rows;

	private int							totalRows;

	private int							updateSeq;

	@SuppressWarnings("unchecked")
	public CouchQueryEnumeratorProxy(TDDatabase db, Map<String, Object> queryResponse) {
		assert db != null;
		assert queryResponse != null;

		this.db = db;
		this.rows = (List<Map<String, Object>>) queryResponse.get("rows");
		this.iterator = this.rows.iterator();
		this.totalRows = (Integer) queryResponse.get("total_rows");
		this.offset = (Integer) queryResponse.get("offset");
		if (queryResponse.containsKey("update_seq")) {
			this.updateSeq = (Integer) queryResponse.get("update_seq");
		}
	}

	@Kroll.method
	public boolean hasNext() {
		return iterator.hasNext();
	}

	public CouchQueryRowProxy next() {
		CouchQueryRowProxy result = null;
		if (iterator.hasNext()) {
			Map<String, Object> row = iterator.next();
			result = new CouchQueryRowProxy(db, row);
		}
		return result;
	}

	@Kroll.method
	public CouchQueryRowProxy nextRow() {
		return this.next();
	}

	public void remove() {
		throw new UnsupportedOperationException();
	}

	@Kroll.method
	public CouchQueryRowProxy rowAtIndex(@Kroll.argument(optional = false) Integer index) {
		return index < rows.size() ? new CouchQueryRowProxy(db, rows.get(index)) : null;
	}
	
	@Kroll.getProperty(name = "rowCount")
	public int rowCount() {
		return rows.size();
	}

	@Kroll.getProperty(name = "sequenceNumber")
	public long sequenceNumber() {
		return db.getLastSequence();
	}

	@Kroll.getProperty(name = "totalCount")
	public int totalCount() {
		return totalRows;
	}
}
