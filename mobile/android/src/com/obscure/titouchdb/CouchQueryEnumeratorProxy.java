package com.obscure.titouchdb;

import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import android.util.Log;

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

		Log.i(LCAT, "query response: " + queryResponse);
		this.db = db;
		this.rows = (List<Map<String, Object>>) queryResponse.get("rows");
		this.iterator = this.rows.iterator();
		this.totalRows = (Integer) queryResponse.get("total_rows");
		this.offset = (Integer) queryResponse.get("offset");
		if (queryResponse.containsKey("update_seq")) {
			this.updateSeq = (Integer) queryResponse.get("update_seq");
		}
	}

	@Kroll.getProperty(name = "rowCount")
	public int rowCount() {
		return rows.size();
	}

	public boolean hasNext() {
		return iterator.hasNext();
	}

	public CouchQueryRowProxy next() {
		Map<String, Object> row = iterator.next();
		return new CouchQueryRowProxy(db, row);
	}

	@Kroll.method
	public CouchQueryRowProxy nextRow() {
		return this.next();
	}

	public void remove() {
		throw new UnsupportedOperationException();
	}

	@Kroll.method
	public CouchQueryRowProxy rowAtIndex(int index) {
		return new CouchQueryRowProxy(db, rows.get(index));
	}

	@Kroll.getProperty(name = "totalCount")
	public int totalCount() {
		return totalRows;
	}
}
