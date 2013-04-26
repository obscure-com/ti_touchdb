package com.obscure.titouchdb.old;

import java.util.Map;

import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.touchdb.TDDatabase;
import com.couchbase.touchdb.TDQueryOptions;
import com.obscure.titouchdb.TitouchdbModule;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class AllDocumentsCouchQueryProxy extends CouchQueryProxy {

	private static final String	LCAT	= "AllDocumentsCouchQueryProxy";

	public AllDocumentsCouchQueryProxy(TDDatabase db) {
		super(db);
	}

	@Override
	public CouchDesignDocumentProxy designDocument() {
		return null;
	}

	@Override
	public CouchQueryEnumeratorProxy rows() {
		TDQueryOptions options = constructQueryOptions();
		Map<String, Object> queryResponse = db.getAllDocs(options);
		return new CouchQueryEnumeratorProxy(db, queryResponse);
	}

}
