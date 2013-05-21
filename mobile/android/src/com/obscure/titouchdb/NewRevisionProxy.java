package com.obscure.titouchdb;

import java.util.HashMap;
import java.util.Map;

import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiBlob;

import com.couchbase.cblite.CBLRevision;
import com.couchbase.cblite.CBLStatus;

@Kroll.proxy(parentModule=TitouchdbModule.class)
public class NewRevisionProxy extends BaseRevisionProxy {

    private CBLRevision parentRevision;
    
    public NewRevisionProxy(DocumentProxy document, CBLRevision rev, CBLRevision parentRevision) {
        super(document, null);
        assert document != null;
        
        this.parentRevision = parentRevision;
        
        // create a new revision and copy parent properties to it
        revision = new CBLRevision(document.getDocumentID(), null, false);
        Map<String,Object> props = new HashMap<String,Object>();
        if (parentRevision != null && parentRevision.getProperties() != null) {
            for (Map.Entry<String, Object> e : parentRevision.getProperties().entrySet()) {
                props.put(e.getKey(), e.getValue());
            }
        }
        revision.setProperties(props);
    }

    @Kroll.setProperty(name="isDeleted")
    public void setIsDeleted(boolean isDeleted) {
        revision.setDeleted(isDeleted);
    }
    
    @Kroll.method
    public void setProperties(Map<String,Object> properties) {
        revision.setProperties(properties);
    }
    
    @Kroll.method
    public void setPropertyForKey(String key, Object value) {
        revision.getProperties().put(key, value);
    }
    
    @Kroll.getProperty(name="parentRevision")
    public RevisionProxy getParentRevision() {
        return parentRevision != null ? new RevisionProxy(document, parentRevision) : null;
    }
    
    @Kroll.getProperty(name="parentRevisionID")
    public String getParentRevisionID() {
        return parentRevision != null ? parentRevision.getRevId() : null;
    }
    
    @Kroll.method
    public RevisionProxy save() {
        String prevRevId = null;
        
        if (parentRevision != null) {
            prevRevId = parentRevision.getRevId();
        }
        
        CBLStatus status = new CBLStatus();
        CBLRevision updated = document.putRevision(this.revision, prevRevId, false, status);
        return updated != null ? new RevisionProxy(document, updated) : null;
    }
    
    @Kroll.method
    public AttachmentProxy addAttachment(String name, String contentType, TiBlob content) {
        return null;
    }
    
    @Kroll.method
    public void removeAttachment(String name) {
        
    }
}
