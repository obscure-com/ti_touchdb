package com.obscure.titouchdb;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiBlob;

import android.util.Log;

import com.couchbase.lite.Attachment;
import com.couchbase.lite.CouchbaseLiteException;
import com.couchbase.lite.Revision;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class AttachmentProxy extends KrollProxy {

    private static final String LCAT      = "AttachmentProxy";

    private KrollDict           lastError = null;

    private Attachment       attachment;

    private DocumentProxy       documentProxy;

    private String              name;

    private long                length;

    private String              contentType;

    private TiBlob              blob;

    public AttachmentProxy(DocumentProxy documentProxy, String name, Attachment attachment, long length) {
        // TODO is documentProxy required?
        assert name != null;
        assert attachment != null;

        this.documentProxy = documentProxy;
        this.name = name;
        this.attachment = attachment;
        this.contentType = attachment.getContentType();
        this.length = length;
    }

    @Kroll.getProperty(name = "name")
    public String getName() {
        return name;
    }

    @Kroll.getProperty(name = "contentType")
    public String getContentType() {
        return contentType;
    }

    @Kroll.getProperty(name = "length")
    public long getLength() {
        if (length < 0) {
            TiBlob body = getBody();
            length = body != null ? body.getLength() : -1;
        }

        return length;
    }

    @Kroll.getProperty(name = "metadata")
    public KrollDict getMetadata() {
        return null;
    }

    @Kroll.getProperty(name = "body")
    public TiBlob getBody() {
        if (blob == null) {
            // sigh, have to read everything into memory to create a TiBlob...
            try {
                int count;
                byte[] buffer = new byte[1024];
                InputStream in = attachment.getContent();
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                while ((count = in.read(buffer, 0, buffer.length)) > 0) {
                    out.write(buffer, 0, count);
                }
                out.flush();
                blob = TiBlob.blobFromData(out.toByteArray(), attachment.getContentType());
            }
            catch (IOException e) {
                Log.e(LCAT, "error reading attachment data: " + e.getMessage());
            }
            catch (CouchbaseLiteException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
        return blob;
    }

    @Kroll.getProperty(name = "bodyURL")
    public URL getBodyURL() {
        // TODO
        return null;
    }

    @Kroll.method
    public RevisionProxy updateBody(TiBlob blob, @Kroll.argument(optional = true) String contentType) {
        RevisionProxy result = null;
        this.blob = blob;
        this.contentType = contentType != null ? contentType : (blob != null ? blob.getMimeType() : null);
        this.length = blob != null ? blob.getLength() : -1;

        if (documentProxy != null) {
            // TODO
            /*
            Revision rev = documentProxy.updateAttachment(name, blob != null ? blob.getInputStream() : null, this.contentType);
            if (rev == null) {
                lastError = documentProxy.getError();
                return null;
            }
            result = new RevisionProxy(documentProxy, rev);
            */
        }
        return result;
    }

    @Kroll.getProperty(name = "error")
    public KrollDict getError() {
        return lastError;
    }

    public Map<String, Object> toAttachmentDictionary() {
        Map<String, Object> result = new HashMap<String, Object>();
        result.put("content_type", getContentType());
        result.put("length", getLength());
        result.put("data", getBody().toBase64());
        return result;
    }

}
