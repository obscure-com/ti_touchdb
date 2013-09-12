package com.obscure.titouchdb;

import java.util.HashMap;
import java.util.Map;

import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiBlob;

import com.couchbase.cblite.CBLRevision;
import com.couchbase.cblite.CBLStatus;

@Kroll.proxy(parentModule=TitouchdbModule.class)
public class NewRevisionProxy extends BaseRevisionProxy {

    private static final String[] EMPTY_STRING_ARRAY = new String[0];

    private static final AttachmentProxy[] EMPTY_ATTACHMENT_PROXY_ARRAY = new AttachmentProxy[0];
    
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
        
        // TODO get the parent attachments and add them to the cache
        
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
        
        // TODO add attachments to updated revision?
        
        return updated != null ? new RevisionProxy(document, updated) : null;
    }

    /*
     * iOS handles this by storing CBLAttachment objects under the _attachments
     * key in the document properties and calling the specific function to save
     * the attachments in putProperties.
     */
    
    private Map<String,AttachmentProxy> attachmentCache = new HashMap<String,AttachmentProxy>();
    
    @Override
    public String[] getAttachmentNames() {
        return attachmentCache.keySet().toArray(EMPTY_STRING_ARRAY);
    }

    @Override
    public AttachmentProxy attachmentNamed(String name) {
        return attachmentCache.get(name);
    }

    @Override
    public AttachmentProxy[] getAttachments() {
        return attachmentCache.values().toArray(EMPTY_ATTACHMENT_PROXY_ARRAY);
    }

    @Kroll.method
    public AttachmentProxy addAttachment(String name, String contentType, TiBlob content) {
        // TODO create the attachment but don't add it yet
        
        
        AttachmentProxy result = document.addAttachment(name, contentType, content);
        if (result != null) {
            attachmentCache.put(name, result);
        }
        return result;
    }
    
    @Kroll.method
    public void removeAttachment(String name) {
        // TODO store a list of attachments to remove?
    }
}
