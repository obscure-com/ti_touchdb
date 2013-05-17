package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiBlob;
import org.appcelerator.titanium.TiContext;

import com.couchbase.cblite.CBLDatabase;
import com.couchbase.cblite.CBLRevision;

@Kroll.proxy(parentModule=TitouchdbModule.class)
public class NewRevisionProxy extends BaseRevisionProxy {

    public NewRevisionProxy(DocumentProxy document, CBLRevision rev) {
        super(document, rev);
        assert document != null;
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
