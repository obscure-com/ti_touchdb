package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import android.util.Log;

import com.couchbase.touchdb.TDRevision;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class CouchRevisionProxy extends KrollProxy {

	private static final String	LCAT				= "CouchRevisionProxy";

	private CouchDocumentProxy	doc;

	private boolean				propertiesAreLoaded	= false;

	private TDRevision			rev;

	public CouchRevisionProxy(CouchDocumentProxy doc, TDRevision rev) {
		assert doc != null;
		assert rev != null;
		this.doc = doc;
		this.rev = rev;
	}

	@Kroll.method
	public CouchAttachmentProxy attachmentNamed(String name) {
		return null;
	}

	@Kroll.getProperty(name = "attachmentNames")
	public String[] attachmentNames() {
		// TODO
		return null;
	}

	@Kroll.method
	public CouchAttachmentProxy createAttachment(String name, String contentType) {
		return null;
	}

	@Kroll.getProperty(name = "document")
	public CouchDocumentProxy document() {
		return doc;
	}

	@Kroll.getProperty(name = "documentID")
	public String documentID() {
		return rev.getDocId();
	}

	protected TDRevision getTDRevision() {
		return rev;
	}

	@Kroll.getProperty(name = "isCurrent")
	public boolean isCurrent() {
		// TODO
		return true;
	}

	@Kroll.getProperty(name = "isDeleted")
	public boolean isDeleted() {
		return rev.isDeleted();
	}

	@Kroll.getProperty(name = "properties")
	public KrollDict properties() {
		if (rev.getProperties() == null && rev.getDocId() != null) {
			// load the full revision if this is a stub
			rev = doc.loadRevision(rev.getRevId());
		}
		propertiesAreLoaded = rev.getProperties() != null;
		return new KrollDict(rev.getProperties());
	}

	/**
	 * Has this object fetched its contents from the server yet?
	 */
	@Kroll.getProperty(name = "propertiesAreLoaded")
	public boolean propertiesAreLoaded() {
		return propertiesAreLoaded;
	}

	@Kroll.method
	public Object propertyForKey(String key) {
		// TODO get and krollify
		return null;
	}

	@Kroll.method
	public void putProperties(KrollDict props) {
		doc.putPropertiesForRevisionID(revisionID(), props);
	}

	@Kroll.getProperty(name = "revisionID")
	public String revisionID() {
		return rev.getRevId();
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

}
