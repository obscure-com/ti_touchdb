package com.obscure.titouchdb;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiBlob;
import org.appcelerator.titanium.io.TiFile;

import android.util.Log;

import com.couchbase.lite.Attachment;
import com.couchbase.lite.BlobKey;
import com.couchbase.lite.BlobStore;
import com.couchbase.lite.CouchbaseLiteException;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class AttachmentProxy extends KrollProxy {

    private static final String   LCAT         = "AttachmentProxy";

    private Attachment            attachment;

    private TiBlob                blob;

    private String                blobFilePath = null;

    private BlobStore             blobStore    = null;

    private KrollDict             lastError    = null;

    private AbstractRevisionProxy revisionProxy;

    public static BlobKey keyForBlobFromStream(InputStream in) {
        MessageDigest md;
        try {
            md = MessageDigest.getInstance("SHA-1");
        }
        catch (NoSuchAlgorithmException e) {
            Log.e(LCAT, "Error, SHA-1 digest is unavailable.");
            return null;
        }
        byte[] sha1hash = new byte[40];

        try {
            byte[] buffer = new byte[65536];
            int lenRead = in.read(buffer);
            while (lenRead > 0) {
                md.update(buffer, 0, lenRead);
                lenRead = in.read(buffer);
            }
        }
        catch (IOException e) {
            Log.e(LCAT, "Error readin tmp file to compute key");
        }

        sha1hash = md.digest();
        BlobKey result = new BlobKey(sha1hash);
        return result;
    }

    public AttachmentProxy(AbstractRevisionProxy revisionProxy, Attachment attachment) {
        assert revisionProxy != null;
        assert attachment != null;

        this.revisionProxy = revisionProxy;
        this.attachment = attachment;

        this.blobStore = new BlobStore(attachment.getDocument().getDatabase().getAttachmentStorePath());

        // find the blob key for this attachment
        BlobKey key = null;
        String digest = (String) attachment.getMetadata().get("digest");
        if (digest != null && digest.startsWith("sha1-")) {
            key = new BlobKey(digest);
        }
        else {
            try {
                key = AttachmentProxy.keyForBlobFromStream(attachment.getContent());
            }
            catch (CouchbaseLiteException e) {
                Log.e(LCAT, e.getMessage());
            }
        }

        // attempt to preload the blob using the key
        if (key != null) {
            blobFilePath = blobStore.pathForKey(key);
            if (blobFilePath != null) {
                blob = TiBlob.blobFromFile(new TiFile(new File(blobFilePath), blobFilePath, false), attachment.getContentType());
            }
        }
    }

    @Kroll.getProperty(name = "content")
    public TiBlob getContent() {
        lastError = null;
        if (blob == null) {
            // blob was not pre-loaded as a file, so read in from stream
            loadBlobFromStream();
        }
        return blob;
    }

    @Kroll.getProperty(name = "contentType")
    public String getContentType() {
        return attachment.getContentType();
    }

    @Kroll.getProperty(name = "contentURL")
    public String getContentURL() {
        lastError = null;
        if (blobFilePath != null) {
            return "file://" + blobFilePath;
        }
        else {
            if (blob == null) {
                loadBlobFromStream();
            }

            return blob != null ? "file://" + blobStore.pathForKey(BlobStore.keyForBlob(blob.getBytes())) : null;
        }
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

    private void loadBlobFromStream() {
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

}
