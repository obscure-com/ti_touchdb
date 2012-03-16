package com.obscure.TiTouchDB;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.touchdb.TDRevision;

@Kroll.proxy
public class TDRevisionProxy extends KrollProxy {

	private TDRevision revision;

	public TDRevisionProxy(TDRevision revision) {
		this.revision = revision;
	}

	public TDRevision getRevision() {
		return revision;
	}

	public void setRevision(TDRevision revision) {
		this.revision = revision;
	}

	@Kroll.getProperty
	public String getDocID() {
		return revision.getDocId();
	}

	@Kroll.getProperty
	public String getRevID() {
		return revision.getRevId();
	}

	@Kroll.getProperty
	public boolean deleted() {
		return revision.isDeleted();
	}

	@Kroll.getProperty(name = "properties")
	public KrollDict getRevisionProperties() {
		return (KrollDict) TitouchdbModule.krollify(revision.getProperties());
	}

	@Kroll.setProperty(name = "properties")
	public void setRevisionProperties(KrollDict properties) {
		revision.setProperties(properties);
	}

	@Kroll.getProperty
	public long sequence() {
		return revision.getSequence();
	}
}
