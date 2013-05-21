package com.obscure.titouchdb;

import java.util.ArrayList;
import java.util.List;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.cblite.CBLRevision;

@Kroll.proxy(creatableInModule = TitouchdbModule.class)
public class BaseRevisionProxy extends KrollProxy {

    protected KrollDict     lastError = null;

    protected CBLRevision   revision;

    protected DocumentProxy document;

    public BaseRevisionProxy(DocumentProxy document, CBLRevision rev) {
        assert rev != null;
        // document object is optional in this class
        this.document = document;
        this.revision = rev;
    }

    @Kroll.getProperty(name = "isDeleted")
    public boolean isDeleted() {
        return revision.isDeleted();
    }

    @Kroll.getProperty(name = "revisionID")
    public String getRevisionID() {
        return revision.getRevId();
    }

    @Kroll.getProperty(name = "properties")
    public KrollDict getRevisionProperties() {
        return new KrollDict(revision.getProperties());
    }

    @Kroll.method
    public RevisionProxy[] getRevisionHistory() {
        return document.getRevisionHistory();
    }
    
    @Kroll.getProperty(name = "userProperties")
    public KrollDict getUserProperties() {
        KrollDict result = new KrollDict(revision.getProperties());
        List<String> keystoremove = new ArrayList<String>();
        for (String key : result.keySet()) {
            if (key.startsWith("_")) {
                keystoremove.add(key);
            }
        }
        for (String key : keystoremove) {
            result.remove(key);
        }
        return result;
    }

    @Kroll.method
    public Object propertyForKey(String key) {
        return revision.getProperties().get(key);
    }

    @Kroll.getProperty(name = "attachmentNames")
    public String[] getAttachmentNames() {
        // TODO
        return null;
    }

    @Kroll.method
    public AttachmentProxy attachmentNamed(String name) {
        // TODO
        return null;
    }

    @Kroll.getProperty(name = "attachments")
    public AttachmentProxy[] getAttachments() {
        // TODO
        return null;
    }

    @Kroll.getProperty(name = "error")
    public KrollDict getError() {
        return lastError;
    }
}
