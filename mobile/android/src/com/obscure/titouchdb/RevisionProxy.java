package com.obscure.titouchdb;

import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.lite.Revision;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class RevisionProxy extends AbstractRevisionProxy {

    private static final String LCAT = "RevisionProxy";

    private Revision revision;

    public RevisionProxy(DocumentProxy document, Revision rev) {
        super(document);
        assert document != null;
        assert rev != null;

        this.revision = rev;
    }

    @Kroll.method
    public RevisionProxy deleteDocument() {
        if (document.deleteDocument()) {
            return document.getCurrentRevision();
        }
        else {
            this.lastError = document.getError();
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
    public RevisionProxy[] getRevisionHistory() {
        return document.getRevisionHistory();
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
        return new UnsavedRevisionProxy(document, this.revision);
    }

    /*
     * Saves a new revision. The properties dictionary must have a "_rev"
     * property whose ID matches the current revision's (as it will if it's a
     * modified copy of this document's .properties property.)
     */
    @Kroll.method
    public RevisionProxy putProperties(Map<String, Object> properties) {
        return document.putProperties(properties);
    }
}
