package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollObject;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiContext;

public class AbstractRevisionProxy extends KrollProxy {

    protected KrollDict lastError = null;
    
    public AbstractRevisionProxy(TiContext tiContext) {
        super(tiContext);
        // TODO Auto-generated constructor stub
    }


    @Kroll.getProperty(name="isDeleted")
    public boolean isDeleted() {
        return false;
    }
    
    @Kroll.getProperty(name="revisionID")
    public String getRevisionID() {
        return null;
    }
    
    @Kroll.getProperty(name="properties")
    public KrollDict getProperties() {
        return null;
    }
    
    @Kroll.getProperty(name="userProperties")
    public KrollDict getUserProperties() {
        return null;
    }
    
    @Kroll.method
    public KrollObject propertyForKey(String key) {
        return null;
    }
    
    @Kroll.getProperty(name="attachmentNames")
    public String[] getAttachmentNames() {
        return null;
    }
    
    @Kroll.method
    public AttachmentProxy attachmentNamed(String name) {
        return null;
    }
    
    @Kroll.getProperty(name="attachments")
    public AttachmentProxy[] getAttachments() {
        return null;
    }
    
    @Kroll.getProperty(name="error")
    public KrollDict getError() {
        return lastError;
    }
}
