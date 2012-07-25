package com.obscure.titouchdb;

import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.touchdb.TDDatabase;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class ViewCouchQueryProxy extends CouchQueryProxy {

	public ViewCouchQueryProxy(TDDatabase db) {
		super(db);
		// TODO Auto-generated constructor stub
	}

	@Kroll.getProperty(name="designDocument")
	public CouchDesignDocumentProxy designDocument() {
		// TODO
		return null;
	}

	@Override
	public CouchQueryEnumeratorProxy rows() {
		// TODO Auto-generated method stub
		return null;
	}

}
