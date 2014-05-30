package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.lite.CouchbaseLiteException;
import com.couchbase.lite.Document;
import com.couchbase.lite.SavedRevision;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class DocumentProxy extends KrollProxy {

    private static final String LCAT                 = "DocumentProxy";

    private SavedRevisionProxy  currentRevisionProxy = null;

    private DatabaseProxy       databaseProxy;

    private Document            document;

    private KrollDict           lastError            = null;

    public DocumentProxy(DatabaseProxy databaseProxy, Document document) {
        assert databaseProxy != null;
        assert document != null;

        this.databaseProxy = databaseProxy;
        this.document = document;
    }

    @Kroll.method
    public UnsavedRevisionProxy createRevision() {
        return new UnsavedRevisionProxy(this, document.createRevision());
    }

    @Kroll.method
    public boolean deleteDocument() {
        try {
            databaseProxy.forgetDocumentProxy(this);
            return document.delete();
        }
        catch (CouchbaseLiteException e) {
            lastError = TitouchdbModule.convertStatusToErrorDict(e.getCBLStatus());
        }
        return false;
    }

    protected void forgetCurrentRevisionProxy() {
        currentRevisionProxy = null;
    }

    @Kroll.getProperty(name = "conflictingRevisions")
    public SavedRevisionProxy[] getConflictingRevisions() {
        try {
            return TitouchdbModule.toRevisionProxyArray(this, document.getConflictingRevisions());
        }
        catch (CouchbaseLiteException e) {
            lastError = TitouchdbModule.convertStatusToErrorDict(e.getCBLStatus());
        }
        return TitouchdbModule.EMPTY_REVISION_PROXY_ARRAY;
    }

    @Kroll.getProperty(name = "currentRevision")
    public SavedRevisionProxy getCurrentRevision() {
        // cache the current revision
        String currentRevisionID = document.getCurrentRevisionId();
        if (currentRevisionProxy == null || !currentRevisionProxy.getRevisionID().equals(currentRevisionID)) {
            SavedRevision revision = document.getCurrentRevision();
            currentRevisionProxy = revision != null ? new SavedRevisionProxy(this, revision) : null;
        }
        return currentRevisionProxy;
    }

    @Kroll.getProperty(name = "currentRevisionID")
    public String getCurrentRevisionID() {
        return document.getCurrentRevisionId();
    }

    @Kroll.getProperty(name = "database")
    public DatabaseProxy getDatabaseProxy() {
        return databaseProxy;
    }

    protected Document getDocument() {
        return document;
    }

    @Kroll.getProperty(name = "documentID")
    public String getDocumentID() {
        return document.getId();
    }

    @Kroll.getProperty(name = "error")
    public KrollDict getLastError() {
        return this.lastError;
    }

    @Kroll.getProperty(name = "leafRevisions")
    public SavedRevisionProxy[] getLeafRevisions() {
        try {
            return TitouchdbModule.toRevisionProxyArray(this, document.getLeafRevisions());
        }
        catch (CouchbaseLiteException e) {
            lastError = TitouchdbModule.convertStatusToErrorDict(e.getCBLStatus());
        }
        return TitouchdbModule.EMPTY_REVISION_PROXY_ARRAY;
    }

    @Kroll.getProperty(name = "properties")
    public KrollDict getProperties() {
        return TypePreprocessor.toKrollDict(document.getProperties());
    }

    @Kroll.method
    public Object getProperty(String key) {
        return TypePreprocessor.preprocess(document.getProperty(key));
    }

    @Kroll.method
    public SavedRevisionProxy getRevision(String id) {
        SavedRevision revision = document.getRevision(id);
        return revision != null ? new SavedRevisionProxy(this, revision) : null;
    }

    @Kroll.getProperty(name = "revisionHistory")
    public SavedRevisionProxy[] getRevisionHistory() {
        try {
            return TitouchdbModule.toRevisionProxyArray(this, document.getRevisionHistory());
        }
        catch (CouchbaseLiteException e) {
            lastError = TitouchdbModule.convertStatusToErrorDict(e.getCBLStatus());
        }

        return TitouchdbModule.EMPTY_REVISION_PROXY_ARRAY;
    }

    @Kroll.getProperty(name = "userProperties")
    public KrollDict getUserProperties() {
        return TypePreprocessor.toKrollDict(document.getUserProperties());
    }

    @Kroll.getProperty(name = "deleted")
    public boolean isDeleted() {
        return document.isDeleted();
    }

    @Kroll.method
    public boolean purgeDocument() {
        try {
            document.purge();
            databaseProxy.forgetDocumentProxy(this);
            return true;
        }
        catch (CouchbaseLiteException e) {
            lastError = TitouchdbModule.convertStatusToErrorDict(e.getCBLStatus());
        }
        return false;
    }

    @Kroll.method
    public SavedRevisionProxy putProperties(KrollDict properties) {
        try {
            SavedRevision revision = document.putProperties(properties);
            currentRevisionProxy = new SavedRevisionProxy(this, revision);
            return currentRevisionProxy;
        }
        catch (CouchbaseLiteException e) {
            lastError = TitouchdbModule.convertStatusToErrorDict(e.getCBLStatus());
        }
        return null;
    }

}
