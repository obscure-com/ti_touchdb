package com.obscure.titouchdb;

import java.util.HashMap;
import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.cblite.CBLAttachment;

@Kroll.proxy(creatableInModule = TitouchdbModule.class)
public abstract class AbstractRevisionProxy extends KrollProxy {

    private static final String[] EMPTY_STRING_ARRAY = new String[0];

    private static final String LCAT = "BaseRevisionProxy";

    protected KrollDict     lastError = null;

    protected DocumentProxy document;

    private Map<String,CBLAttachment> attachments = new HashMap<String,CBLAttachment>();

    public AbstractRevisionProxy(DocumentProxy document) {
        // document object is optional in this class
        this.document = document;
        
        // TODO convert attachment metadata to attachment proxy objects
        
    }

    @Kroll.getProperty(name = "revisionID")
    public String getRevisionID() {
        return null;
    }

    @Kroll.getProperty(name="properties")
    public abstract KrollDict getRevisionProperties();

    @Kroll.getProperty(name = "userProperties")
    public KrollDict getUserProperties() {
        KrollDict rev = getRevisionProperties();
        if (rev == null) return null;
        
        KrollDict result = new KrollDict();
        for (String key : result.keySet()) {
            if (!key.startsWith("_")) {
                result.put(key, rev.get(key));
            }
        }
        return result;
    }

    @Kroll.method
    public Object propertyForKey(String key) {
        KrollDict rev = getRevisionProperties();
        return rev != null ? rev.get(key) : null;
    }

    @Kroll.getProperty(name = "attachmentNames")
    public String[] getAttachmentNames() {
        // TODO
        return EMPTY_STRING_ARRAY;
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
