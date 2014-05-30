package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.lite.CouchbaseLiteException;
import com.couchbase.lite.SavedRevision;
import com.couchbase.lite.UnsavedRevision;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class SavedRevisionProxy extends AbstractRevisionProxy {

    private static final String LCAT = "RevisionProxy";

    public SavedRevisionProxy(DocumentProxy documentProxy, SavedRevision revision) {
        super(documentProxy, revision);
    }

    @Kroll.method
    public AbstractRevisionProxy createRevision(@Kroll.argument(optional = true) KrollDict properties) {
        lastError = null;
        try {
            if (properties != null) {
                ((SavedRevision) revision).createRevision(properties);
                documentProxy.forgetCurrentRevisionProxy();
                return documentProxy.getCurrentRevision();
            }
            else {
                UnsavedRevision unsaved = ((SavedRevision) revision).createRevision();
                return new UnsavedRevisionProxy(documentProxy, unsaved);
            }
        }
        catch (CouchbaseLiteException e) {
            lastError = TitouchdbModule.convertStatusToErrorDict(e.getCBLStatus());
        }
        return null;
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

    @Kroll.getProperty(name = "propertiesAvailable")
    public boolean isPropertiesAvailable() {
        return ((SavedRevision) revision).arePropertiesAvailable();
    }

}
