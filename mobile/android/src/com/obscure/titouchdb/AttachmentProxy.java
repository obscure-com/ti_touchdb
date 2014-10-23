package com.obscure.titouchdb;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiBlob;

import android.util.Log;

import com.couchbase.lite.Attachment;
import com.couchbase.lite.BlobStore;
import com.couchbase.lite.BlobStoreWriter;
import com.couchbase.lite.CouchbaseLiteException;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class AttachmentProxy extends KrollProxy {

    private static final String   LCAT      = "AttachmentProxy";

    private Attachment            attachment;

    private TiBlob                blob;

    private KrollDict             lastError = null;

    private AbstractRevisionProxy revisionProxy;

    public AttachmentProxy(AbstractRevisionProxy revisionProxy, Attachment attachment) {
        assert revisionProxy != null;
        assert attachment != null;

        this.revisionProxy = revisionProxy;
        this.attachment = attachment;
    }

    @Kroll.getProperty(name = "content")
    public TiBlob getContent() {
        lastError = null;
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
                lastError = TitouchdbModule.convertStatusToErrorDict(e.getCBLStatus());
            }
        }
        return blob;
    }

    @Kroll.getProperty(name = "contentType")
    public String getContentType() {
        return attachment.getContentType();
    }
    
    @Kroll.getProperty(name = "contentURL")
    public String getContentURL() {
        BlobStore store = new BlobStore(attachment.getDocument().getDatabase().getAttachmentStorePath());
        return "file://" + store.pathForKey(BlobStore.keyForBlob(getContent().getBytes()));
    }

    @Kroll.getProperty(name = "document")
    public DocumentProxy getDocument() {
        return revisionProxy.getDocumentProxy();
    }

    @Kroll.getProperty(name = "error")
    public KrollDict getLastError() {
        return lastError;
    }

    @Kroll.getProperty(name = "length")
    public long getLength() {
        return attachment.getLength();
    }
    
    @Kroll.getProperty(name = "metadata")
    public KrollDict getMetadata() {
        return TypePreprocessor.toKrollDict(attachment.getMetadata());
    }

    @Kroll.getProperty(name = "name")
    public String getName() {
        return attachment.getName();
    }

    @Kroll.method
    public AbstractRevisionProxy getRevision() {
        return revisionProxy;
    }

}
