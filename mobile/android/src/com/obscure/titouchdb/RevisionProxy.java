package com.obscure.titouchdb;

import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.cblite.CBLRevision;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class RevisionProxy extends AbstractRevisionProxy {

    private static final String LCAT = "RevisionProxy";

    private CBLRevision revision;

    public RevisionProxy(DocumentProxy document, CBLRevision rev) {
        super(document);
        assert document != null;
        assert rev != null;

        this.revision = rev;
    }

    @Kroll.method
    public RevisionProxy deleteDocument() {
        if (document.deleteDocument()) {
            CBLRevision rev = document.getCurrentCBLRevision();
            return new RevisionProxy(document, rev);
        }
        else {
            this.lastError = document.getError();
            return null;
        }
    }
    
    @Kroll.getProperty(name = "isDeleted")
    public boolean isDeleted() {
        return revision.isDeleted();
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
        return revision.getRevId();
    }

    @Override
    @Kroll.getProperty(name = "properties")
    public KrollDict getRevisionProperties() {
        return new KrollDict(revision.getProperties());
    }

    @Kroll.method
    public NewRevisionProxy newRevision() {
        return new NewRevisionProxy(document, this.revision);
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
