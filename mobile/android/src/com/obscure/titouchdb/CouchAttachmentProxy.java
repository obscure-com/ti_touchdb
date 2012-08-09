package com.obscure.titouchdb;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

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

	private byte[]				data;

	private CouchDocumentProxy	document;

	private String				filename;

	private TDRevision			revision;

	private CouchRevisionProxy	revisionProxy;
	
	private TiBlob body;

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
		if (body == null) {
			body = TiBlob.blobFromData(getAttachmentData(), attachment.getContentType()); 
		}
		return body;
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

	private byte[] getAttachmentData() {
		if (data == null) {
			try {
				InputStream in = attachment.getContentStream();
				ByteArrayOutputStream out = new ByteArrayOutputStream();
				byte[] buffer = new byte[2048];
				int count;
				while ((count = in.read(buffer)) > 0) {
					out.write(buffer, 0, count);
				}
				data = out.toByteArray();
			}
			catch (IOException e) {
				Log.e(LCAT, e.getMessage());
			}
		}
		return data != null ? data : new byte[0];
	}

	@Kroll.getProperty(name = "length")
	public int length() {
		return getAttachmentData().length;
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
		this.body = null;
		
		if (body == null || body.getBytes() == null) return;
		data = body.getBytes();
		attachment.setContentStream(new ByteArrayInputStream(data));

		String contentType = body.getMimeType();
		if (contentType != null && attachment.getContentType() != null && !attachment.getContentType().startsWith(contentType)) {
			Log.w(LCAT, "blob content type of '" + contentType + "' does not match declared attachment type '" + attachment.getContentType() + "'");
		}

		document.saveAttachment(attachment, filename);
	}

}
