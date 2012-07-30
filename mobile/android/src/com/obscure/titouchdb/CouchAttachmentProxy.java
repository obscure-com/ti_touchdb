package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiBlob;

import android.util.Log;

import com.couchbase.touchdb.TDAttachment;
import com.couchbase.touchdb.TDRevision;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class CouchAttachmentProxy extends KrollProxy {

	private static final String	DEFAULT_MIMETYPE	= "application/octet-stream";

	private static final String	LCAT				= "CouchAttachmentProxy";

	private TDAttachment		attachment;

	private CouchDocumentProxy	document;

	private String				filename;

	private TDRevision			revision;

	private CouchRevisionProxy	revisionProxy;

	public CouchAttachmentProxy(CouchDocumentProxy document, TDRevision revision, TDAttachment attachment, String filename) {
		assert document != null;
		assert revision != null;
		assert attachment != null;
		assert filename != null;

		this.document = document;
		this.revision = revision;
		this.attachment = attachment;
		this.filename = filename;
	}

	@Kroll.getProperty(name = "body")
	public TiBlob body() {
		byte[] data = attachment.getData();
		if (data == null) {
			data = new byte[0];
		}
		return TiBlob.blobFromData(data, attachment.getContentType());
	}

	@Kroll.getProperty(name = "contentType")
	public String contentType() {
		return attachment.getContentType();
	}

	@Kroll.method
	public void deleteAttachment() {
		// TODO
	}

	@Kroll.getProperty(name = "documentument")
	public CouchDocumentProxy document() {
		return document;
	}

	@Kroll.getProperty(name = "length")
	public Long length() {
		byte[] data = attachment.getData();
		return data != null ? data.length : 0L;
	}

	@Kroll.getProperty(name = "metadata")
	public KrollDict metadata() {
		// TODO
		return null;
	}

	@Kroll.getProperty(name = "name")
	public String name() {
		return filename;
	}

	@Kroll.getProperty(name = "relativePath")
	public String relativePath() {
		return filename;
	}

	@Kroll.getProperty(name = "revision")
	public CouchRevisionProxy revision() {
		if (revisionProxy == null) {
			revisionProxy = new CouchRevisionProxy(document, revision);
		}
		return revisionProxy;
	}

	@Kroll.setProperty(name = "body")
	public void setBody(TiBlob body) {
		if (body == null || body.getBytes() == null) return;
		attachment.setData(body.getBytes());

		String contentType = body.getMimeType();
		if (contentType != null && attachment.getContentType() != null && !attachment.getContentType().startsWith(contentType)) {
			Log.w(LCAT, "blob content type of '" + contentType + "' does not match declared attachment type '" + attachment.getContentType() + "'");
		}

		document.saveAttachment(attachment, filename);
	}

}
