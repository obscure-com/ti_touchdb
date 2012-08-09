package com.obscure.titouchdb;

import java.util.List;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.touchdb.TDAttachment;
import com.couchbase.touchdb.TDRevision;
import com.obscure.titouchdb.js.TypeConverter;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class CouchRevisionProxy extends KrollProxy {

	private static final String		LCAT				= "CouchRevisionProxy";

	private static final String[]	EMPTY_STRING_ARRAY	= new String[0];

	private CouchDocumentProxy		doc;

	private boolean					propertiesAreLoaded	= false;

	private TDRevision				rev;

	public CouchRevisionProxy(CouchDocumentProxy doc, TDRevision rev) {
		assert doc != null;
		assert rev != null;
		this.doc = doc;
		this.rev = rev;
	}

	@Kroll.method
	public CouchAttachmentProxy attachmentNamed(String name) {
		TDAttachment attachment = doc.attachmentNamed(name);
		return attachment != null ? new CouchAttachmentProxy(doc, rev, attachment, name) : null;
	}

	@Kroll.getProperty(name = "attachmentNames")
	public String[] attachmentNames() {
		List<String> names = doc.attachmentNames();
		return names != null ? names.toArray(EMPTY_STRING_ARRAY) : EMPTY_STRING_ARRAY;
	}

	@Kroll.method
	public CouchAttachmentProxy createAttachment(String name, String contentType) {
		TDAttachment attachment = new TDAttachment(null, contentType);
		return new CouchAttachmentProxy(doc, rev, attachment, name);
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
		// no revisions, so we must be the current rev
		if (doc.currentRevision == null || doc.currentRevision.getRevId() == null) return true; 
		
		// if we don't have a rev id and there is already a current revision, then
		// we can't be current
		if (rev.getRevId() == null) return false;
		
		// otherwise, if the current rev ID and our ID match, we are current
		return rev.getRevId().equals(doc.currentRevision.getRevId());
	}

	@Kroll.getProperty(name = "isDeleted")
	public boolean isDeleted() {
		return rev.isDeleted();
	}

	@Kroll.getProperty(name = "properties")
	public KrollDict properties() {
		if (rev.getProperties() == null && rev.getDocId() != null) {
			// load the full revision if this is a stub
			rev = doc.loadRevision(rev.getDocId(), rev.getRevId());
		}
		propertiesAreLoaded = rev.getProperties() != null;
		return (KrollDict) TypeConverter.toJSObject(rev.getProperties());
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
		return properties().get(key);
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
				result.put(key, TypeConverter.toJSObject(props.get(key)));
			}
		}
		return result;
	}

}
