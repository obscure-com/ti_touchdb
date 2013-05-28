package com.obscure.titouchdb;

import java.util.HashMap;
import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiBlob;

import com.couchbase.cblite.CBLAttachment;
import com.couchbase.cblite.CBLRevision;
import com.couchbase.cblite.CBLStatus;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class NewRevisionProxy extends AbstractRevisionProxy {

    private CBLRevision         parentRevision;

    private Map<String, Object> properties = new HashMap<String, Object>();

    public NewRevisionProxy(DocumentProxy document, CBLRevision parentRevision) {
        super(document);
        assert document != null;

        this.parentRevision = parentRevision;
        if (parentRevision != null && parentRevision.getProperties() != null) {
            properties.putAll(parentRevision.getProperties());
        }
    }

    @Kroll.method
    public AttachmentProxy addAttachment(String name, String contentType, TiBlob content) {
        // return document.addAttachment(revision, name, contentType, content);
        return null;
    }

    @Kroll.getProperty(name = "parentRevision")
    public RevisionProxy getParentRevision() {
        return parentRevision != null ? new RevisionProxy(document, parentRevision) : null;
    }

    @Kroll.getProperty(name = "parentRevisionID")
    public String getParentRevisionID() {
        return parentRevision != null ? parentRevision.getRevId() : null;
    }

    @Override
    @Kroll.getProperty(name = "properties")
    public KrollDict getRevisionProperties() {
        return new KrollDict(properties);
    }

    @Kroll.method
    public void removeAttachment(String name) {

    }

    @Kroll.method
    public RevisionProxy save() {
        String prevRevId = null;

        if (parentRevision != null) {
            prevRevId = parentRevision.getRevId();
        }

        CBLStatus status = new CBLStatus();
        CBLRevision revision = new CBLRevision(properties);
        CBLRevision updated = document.putRevision(revision, prevRevId, false, status);

        // TODO store/remove attachments

        return updated != null ? new RevisionProxy(document, updated) : null;
    }

    @Kroll.setProperty(name = "isDeleted")
    public void setIsDeleted(boolean isDeleted) {
        properties.put("_deleted", true);
    }

    @Kroll.method
    public void setProperties(Map<String, Object> properties) {
        assert properties != null;
        this.properties = properties;
    }

    @Kroll.method
    public void setPropertyForKey(String key, Object value) {
        properties.put(key, value);
    }
}
