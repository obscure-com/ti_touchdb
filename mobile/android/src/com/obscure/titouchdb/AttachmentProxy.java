package com.obscure.titouchdb;

import java.net.URL;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiBlob;
import org.appcelerator.titanium.TiContext;

public class AttachmentProxy extends KrollProxy {

    private KrollDict lastError = null;
    
    public AttachmentProxy(TiContext tiContext) {
        super(tiContext);
        // TODO Auto-generated constructor stub
    }
    
    @Kroll.getProperty(name="name")
    public String getName() {
        return null;
    }
    
    @Kroll.getProperty(name="contentType")
    public String getContentType() {
        return null;
    }
    
    @Kroll.getProperty(name="length")
    public long getLength() {
        return 0;
    }
    
    @Kroll.getProperty(name="metadata")
    public KrollDict getMetadata() {
        return null;
    }

    @Kroll.getProperty(name="body")
    public TiBlob getBody() {
        return null;
    }
    
    @Kroll.getProperty(name="bodyURL")
    public URL getBodyURL() {
        return null;
    }
    
    @Kroll.method
    public RevisionProxy updateBody(TiBlob body, String contentType) {
        return null;
    }
    
    @Kroll.getProperty(name="error")
    public KrollDict getError() {
        return lastError;
    }
    
   
}
