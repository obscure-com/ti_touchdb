package com.obscure.titouchdb;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiBlob;

import android.util.Log;

import com.couchbase.cblite.CBLAttachment;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class AttachmentProxy extends KrollProxy {

    private static final String LCAT      = "AttachmentProxy";

    private KrollDict           lastError = null;

    private CBLAttachment       attachment;

    private String              name;

    private long                length;

    public AttachmentProxy(String name, CBLAttachment attachment, long length) {
        assert name != null;
        assert attachment != null;

        this.name = name;
        this.attachment = attachment;
        this.length = length;
    }

    @Kroll.getProperty(name = "name")
    public String getName() {
        return name;
    }

    @Kroll.getProperty(name = "contentType")
    public String getContentType() {
        return attachment.getContentType();
    }

    @Kroll.getProperty(name = "length")
    public long getLength() {
        return length;
    }

    @Kroll.getProperty(name = "metadata")
    public KrollDict getMetadata() {
        return null;
    }

    @Kroll.getProperty(name = "body")
    public TiBlob getBody() {
        // sigh, have to read everything into memory to create a TiBlob...
        try {
            int count;
            byte[] buffer = new byte[1024];
            InputStream in = attachment.getContentStream();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            while ((count = in.read(buffer, 0, buffer.length)) > 0) {
                out.write(buffer, 0, count);
            }
            out.flush();
            return TiBlob.blobFromData(out.toByteArray(), attachment.getContentType());
        }
        catch (IOException e) {
            Log.e(LCAT, "error reading attachment data: " + e.getMessage());
        }
        return null;
    }

    @Kroll.getProperty(name = "bodyURL")
    public URL getBodyURL() {
        // TODO
        return null;
    }

    @Kroll.method
    public RevisionProxy updateBody(TiBlob body, @Kroll.argument(optional = true) String contentType) {
        // TODO
        // if body is null, delete the attachment
        return null;
    }

    @Kroll.getProperty(name = "error")
    public KrollDict getError() {
        return lastError;
    }

}
