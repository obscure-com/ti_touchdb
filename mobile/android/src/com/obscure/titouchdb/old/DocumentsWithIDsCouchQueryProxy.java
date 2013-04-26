package com.obscure.titouchdb.old;

import java.util.Arrays;
import java.util.Map;

import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.touchdb.TDDatabase;
import com.obscure.titouchdb.TitouchdbModule;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class DocumentsWithIDsCouchQueryProxy extends CouchQueryProxy {

	private static final String	LCAT	= "DocumentsWithIDsCouchQueryProxy";

	private String[]			ids;

	public DocumentsWithIDsCouchQueryProxy(TDDatabase db, String[] ids) {
		super(db);
		this.ids = ids;
	}

	@Override
	public CouchDesignDocumentProxy designDocument() {
		return null;
	}

	@Override
	public CouchQueryEnumeratorProxy rows() {
		if (ids == null) return null;
		Map<String, Object> queryResponse = db.getDocsWithIDs(Arrays.asList(ids), constructQueryOptions());
		return queryResponse != null ? new CouchQueryEnumeratorProxy(db, queryResponse) : null;
	}

}
