package com.obscure.titouchdb;

import java.util.Map;

import org.appcelerator.kroll.annotations.Kroll;

import android.util.Log;

import com.couchbase.cblite.CBLRevision;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class RevisionProxy extends BaseRevisionProxy {

    public RevisionProxy(DocumentProxy document, CBLRevision rev) {
        super(document, rev);
        assert document != null;
    }

    private static final String LCAT = "RevisionProxy";

    @Kroll.method
    public RevisionProxy deleteDocument() {
        if (document.deleteDocument()) {
            return new RevisionProxy(document, document.getCurrentCBLRevision());
        }
        else {
            this.lastError = document.getError();
            return null;
        }
    }

    @Kroll.getProperty(name = "propertiesAreLoaded")
    public boolean getPropertiesAreLoaded() {
        return true;
    }

    @Kroll.method
    public NewRevisionProxy newRevision() {
        return new NewRevisionProxy(document, null, this.revision);
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
