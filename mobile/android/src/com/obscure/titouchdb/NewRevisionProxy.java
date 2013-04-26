package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiBlob;
import org.appcelerator.titanium.TiContext;

public class NewRevisionProxy extends AbstractRevisionProxy {

    public NewRevisionProxy(TiContext tiContext) {
        super(tiContext);
        // TODO Auto-generated constructor stub
    }

    @Kroll.setProperty(name="isDeleted")
    public void setIsDeleted(boolean isDeleted) {
        
    }
    
    @Kroll.method
    public void setProperties(KrollDict properties) {
        
    }
    
    @Kroll.getProperty(name="parentRevision")
    public RevisionProxy getParentRevision() {
        return null;
    }
    
    @Kroll.getProperty(name="parentRevisionID")
    public String getParentRevisionID() {
        return null;
    }
    
    @Kroll.method
    public RevisionProxy save() {
        return null;
    }
    
    @Kroll.method
    public AttachmentProxy addAttachment(String name, String contentType, TiBlob content) {
        return null;
    }
    
    @Kroll.method
    public void removeAttachment(String name) {
        
    }
}
