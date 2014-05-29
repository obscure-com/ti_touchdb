package com.obscure.titouchdb;

import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.lite.CouchbaseLiteException;
import com.couchbase.lite.SavedRevision;
import com.couchbase.lite.UnsavedRevision;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class SavedRevisionProxy extends AbstractRevisionProxy {

    private static final String LCAT = "RevisionProxy";

    private SavedRevision revision;

    public SavedRevisionProxy(DocumentProxy documentProxy, SavedRevision revision) {
        super(documentProxy);
        assert documentProxy != null;
        assert revision != null;

        this.revision = revision;
    }
    
    @Kroll.method
    public AbstractRevisionProxy createRevision(@Kroll.argument(optional=true) KrollDict properties) {
        lastError = null;
        try {
        if (properties != null) {
            revision.createRevision(properties);
            documentProxy.forgetCurrentRevisionProxy();
            return documentProxy.getCurrentRevision();
        }
        else {
            UnsavedRevision unsaved = revision.createRevision();
            return new UnsavedRevisionProxy(documentProxy, unsaved);
        }
        }
        catch (CouchbaseLiteException e) {
            lastError = TitouchdbModule.convertStatusToErrorDict(e.getCBLStatus());
        }
        return  null;
        
        /*
        UnsavedRevisionProxy unsaved = documentProxy.createRevision();
        if (properties != null) {
            // Creates and saves a new Revision with the specified properties.
            unsaved.setRevisionProperties(properties);
            return unsaved.save(false);
        }
        else {
            // Creates a new UnsavedRevision whose properties and attachments are initially identical to this one.
            unsaved.setRevisionProperties(this.getRevisionProperties());
            for (AttachmentProxy attachmentProxy : getAttachments()) {
                unsaved.setAttachment(attachmentProxy.getName(), attachmentProxy.getContentType(), attachmentProxy.getBody());
            }
            return unsaved;
        }
        */
    }
    
    @Kroll.method
    public SavedRevisionProxy deleteDocument() {
        if (documentProxy.deleteDocument()) {
            return documentProxy.getCurrentRevision();
        }
        else {
            this.lastError = documentProxy.getLastError();
            return null;
        }
    }
    
    @Kroll.getProperty(name = "isDeleted")
    public boolean isDeleted() {
        return revision.isDeletion();
    }

    @Kroll.getProperty(name = "propertiesAreLoaded")
    public boolean getPropertiesAreLoaded() {
        return true;
    }

    @Kroll.method
    public SavedRevisionProxy[] getRevisionHistory() {
        return documentProxy.getRevisionHistory();
    }

    @Override
    @Kroll.getProperty(name = "revisionID")
    public String getRevisionID() {
        return revision.getId();
    }

    @Override
    @SuppressWarnings("unchecked")
    @Kroll.getProperty(name = "properties")
    public KrollDict getRevisionProperties() {
        return new KrollDict((Map<? extends String, ? extends Object>) TypePreprocessor.preprocess(revision.getProperties()));
    }
    
    @Override
    @SuppressWarnings("unchecked")
    @Kroll.getProperty(name = "userProperties")
    public KrollDict getUserProperties() {
        return new KrollDict((Map<? extends String, ? extends Object>) TypePreprocessor.preprocess(revision.getUserProperties()));
    }

    /*
     * Saves a new revision. The properties dictionary must have a "_rev"
     * property whose ID matches the current revision's (as it will if it's a
     * modified copy of this document's .properties property.)
     */
    @Kroll.method
    public SavedRevisionProxy putProperties(KrollDict properties) {
        return documentProxy.putProperties(properties);
    }
}
