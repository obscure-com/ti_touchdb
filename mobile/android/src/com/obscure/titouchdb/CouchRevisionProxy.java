package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.touchdb.TDRevision;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class CouchRevisionProxy extends KrollProxy {

	private TDRevision rev;
	
	public CouchRevisionProxy(TDRevision rev) {
		assert rev != null;
		this.rev = rev;
	}

	@Kroll.getProperty(name="document")
	public CouchDocumentProxy document() {
		// TODO 
		return null;
	}
	
	@Kroll.getProperty(name="documentID")
	public String documentID() {
		return rev.getDocId();
	}
	
	
}
