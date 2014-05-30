package com.obscure.titouchdb;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import android.util.Log;

import com.couchbase.lite.Attachment;
import com.couchbase.lite.CouchbaseLiteException;
import com.couchbase.lite.Revision;
import com.couchbase.lite.SavedRevision;

@Kroll.proxy(creatableInModule = TitouchdbModule.class)
public abstract class AbstractRevisionProxy extends KrollProxy {

    private static final AttachmentProxy[] EMPTY_ATTACHMENT_PROXY_ARRAY = new AttachmentProxy[0];

    private static final String[]          EMPTY_STRING_ARRAY           = new String[0];

    private static final String            LCAT                         = "AbstractRevisionProxy";

    protected DocumentProxy                documentProxy;

    protected KrollDict                    lastError                    = null;

    protected Revision                     revision                     = null;

    public AbstractRevisionProxy(DocumentProxy documentProxy, Revision revision) {
        assert documentProxy != null;
        assert revision != null;

        this.documentProxy = documentProxy;
        this.revision = revision;
    }

    @Kroll.method
    public AttachmentProxy getAttachment(String name) {
        try {
            // doesn't return null after an attachment is deleted; see
            // https://github.com/couchbase/couchbase-lite-java-core/issues/218
            Attachment attachment = revision.getAttachment(name);
            return attachment != null && attachment.getContent() != null ? new AttachmentProxy(this, attachment) : null;
        }
        catch (CouchbaseLiteException e) {
            // ignore
        }
        return null;
    }

    @Kroll.getProperty(name = "attachmentNames")
    public String[] getAttachmentNames() {
        List<String> names = revision.getAttachmentNames();
        return names != null ? names.toArray(EMPTY_STRING_ARRAY) : EMPTY_STRING_ARRAY;
    }

    @Kroll.getProperty(name = "attachments")
    public AttachmentProxy[] getAttachments() {
        List<AttachmentProxy> proxies = new ArrayList<AttachmentProxy>();
        for (Attachment attachment : revision.getAttachments()) {
            proxies.add(new AttachmentProxy(this, attachment));
        }
        return proxies.toArray(EMPTY_ATTACHMENT_PROXY_ARRAY);
    }

    @Kroll.getProperty(name = "database")
    public DatabaseProxy getDatabaseProxy() {
        return documentProxy.getDatabaseProxy();
    }

    @Kroll.method(name = "getDocument")
    public DocumentProxy getDocumentProxy() {
        return documentProxy;
    }

    @Kroll.getProperty(name = "error")
    public KrollDict getError() {
        return lastError;
    }

    @Kroll.getProperty(name = "parent")
    public SavedRevisionProxy getParent() {
        SavedRevision parent = revision.getParent();
        return parent != null ? new SavedRevisionProxy(documentProxy, parent) : null;
    }

    @Kroll.getProperty(name = "parentID")
    public String getParentID() {
        return revision.getParentId();
    }

    @Kroll.method
    public Object getProperty(String key) {
        return TypePreprocessor.preprocess(revision.getProperty(key));
    }

    @Kroll.getProperty(name = "revisionHistory")
    public SavedRevisionProxy[] getRevisionHistory() {
        try {
            return TitouchdbModule.toRevisionProxyArray(documentProxy, revision.getRevisionHistory());
        }
        catch (CouchbaseLiteException e) {
            lastError = TitouchdbModule.convertStatusToErrorDict(e.getCBLStatus());
        }
        return TitouchdbModule.EMPTY_REVISION_PROXY_ARRAY;
    }

    @Kroll.getProperty(name = "revisionID")
    public String getRevisionID() {
        return revision.getId();
    }

    @Kroll.getProperty(name = "properties")
    public KrollDict getRevisionProperties() {
        return TypePreprocessor.toKrollDict(revision.getProperties());
    }

    @Kroll.getProperty(name = "userProperties")
    public KrollDict getUserProperties() {
        return TypePreprocessor.toKrollDict(revision.getUserProperties());
    }

    @Kroll.getProperty(name = "isDeletion")
    public boolean isDeletion() {
        return revision.isDeletion();
    }

}
