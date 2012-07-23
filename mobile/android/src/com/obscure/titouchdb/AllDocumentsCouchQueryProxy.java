package com.obscure.titouchdb;

import java.util.Map;

import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.touchdb.TDDatabase;
import com.couchbase.touchdb.TDQueryOptions;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class AllDocumentsCouchQueryProxy extends CouchQueryProxy {

	private static final String	LCAT	= "AllDocumentsCouchQueryProxy";

	public AllDocumentsCouchQueryProxy(TDDatabase db) {
		super(db);
	}

	@Override
	public CouchQueryEnumeratorProxy rows() {
		TDQueryOptions options = constructQueryOptions();
		Map<String, Object> queryResponse = db.getAllDocs(options);
		return new CouchQueryEnumeratorProxy(db, queryResponse);
	}

	@Override
	public CouchQueryEnumeratorProxy rowsIfChanged() {
		// TODO
		// Same as -rows, except returns nil if the query results have not
		// changed since the last time it was evaluated
		return this.rows();
	}

}
