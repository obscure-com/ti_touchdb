package com.obscure.titouchdb;

import java.util.List;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.lite.Attachment;
import com.couchbase.lite.Revision;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class SavedRevisionProxy extends AbstractRevisionProxy {

    private static final String LCAT = "RevisionProxy";

    private static final String[] EMPTY_STRING_ARRAY = new String[0];

    private Revision revision;

    public SavedRevisionProxy(DocumentProxy document, Revision rev) {
        super(document);
        assert document != null;
        assert rev != null;

        this.revision = rev;
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
    @Kroll.getProperty(name = "properties")
    public KrollDict getRevisionProperties() {
        return new KrollDict(revision.getProperties());
    }

    @Kroll.method
    public UnsavedRevisionProxy newRevision() {
        return new UnsavedRevisionProxy(documentProxy, this.revision);
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
