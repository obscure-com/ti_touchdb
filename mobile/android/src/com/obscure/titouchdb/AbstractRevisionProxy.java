package com.obscure.titouchdb;

import java.util.HashMap;
import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.cblite.CBLAttachment;
import com.couchbase.cblite.CBLDatabase;
import com.couchbase.cblite.CBLStatus;

@Kroll.proxy(creatableInModule = TitouchdbModule.class)
public abstract class AbstractRevisionProxy extends KrollProxy {

    private static final AttachmentProxy[] EMPTY_ATTACHMENT_PROXY_ARRAY = new AttachmentProxy[0];

    private static final String[]          EMPTY_STRING_ARRAY           = new String[0];

    private static final String            LCAT                         = "BaseRevisionProxy";

    private Map<String, AttachmentProxy>   attachmentProxies            = null;

    protected DocumentProxy                document;

    protected KrollDict                    lastError                    = null;

    public AbstractRevisionProxy(DocumentProxy document) {
        // document object is optional in this class
        this.document = document;
    }

    @Kroll.method
    public AttachmentProxy attachmentNamed(String name) {
        return getAttachmentProxies().get(name);
    }

    @Kroll.getProperty(name = "attachmentNames")
    public String[] getAttachmentNames() {
        return getAttachmentProxies().keySet().toArray(EMPTY_STRING_ARRAY);
    }

    /**
     * reads the _attachment metadata from the document and populates the
     * attachment proxy cache.
     */
    protected Map<String, AttachmentProxy> getAttachmentProxies() {
        if (attachmentProxies == null) {
            attachmentProxies = new HashMap<String, AttachmentProxy>();
            KrollDict rev = getRevisionProperties();
            long seq = getRevisionSequence();
            if (rev != null && seq > -1 && rev.containsKey("_attachments")) {
                CBLDatabase db = document.getDatabase();
                KrollDict atts = rev.getKrollDict("_attachments");
                CBLStatus status = new CBLStatus();
                for (String filename : atts.keySet()) {
                    CBLAttachment att = db.getAttachmentForSequence(seq, filename, status);
                    if (att != null) {
                        attachmentProxies.put(filename, new AttachmentProxy(document, filename, att, -1));
                    }
                }
            }
        }
        return attachmentProxies;
    }

    @Kroll.getProperty(name = "attachments")
    public AttachmentProxy[] getAttachments() {
        return getAttachmentProxies().entrySet().toArray(EMPTY_ATTACHMENT_PROXY_ARRAY);
    }

    @Kroll.getProperty(name = "error")
    public KrollDict getError() {
        return lastError;
    }

    @Kroll.getProperty(name = "revisionID")
    public String getRevisionID() {
        return null;
    }

    @Kroll.getProperty(name = "properties")
    public abstract KrollDict getRevisionProperties();

    protected long getRevisionSequence() {
        return -1;
    }

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
}
