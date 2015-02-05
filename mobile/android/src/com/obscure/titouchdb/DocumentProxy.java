package com.obscure.titouchdb;

import java.lang.ref.WeakReference;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.lite.CouchbaseLiteException;
import com.couchbase.lite.Document;
import com.couchbase.lite.Document.ChangeEvent;
import com.couchbase.lite.SavedRevision;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class DocumentProxy extends KrollProxy implements Document.ChangeListener {

    private static final String               LCAT                     = "DocumentProxy";

    private WeakReference<SavedRevisionProxy> weakCurrentRevisionProxy = null;

    private DatabaseProxy                     databaseProxy;

    private Document                          document;

    private KrollDict                         lastError                = null;

    public DocumentProxy(DatabaseProxy databaseProxy, Document document) {
        assert databaseProxy != null;
        assert document != null;

        this.databaseProxy = databaseProxy;
        this.document = document;

        document.addChangeListener(this);
    }

    @Override
    public void changed(ChangeEvent change) {
        KrollDict dict = new KrollDict();
        dict.put("document", this);
        dict.put("change", new DocumentChangeProxy(change.getChange()));

        fireEvent("change", dict);
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
        weakCurrentRevisionProxy = null;
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
        SavedRevisionProxy currentRevisionProxy = weakCurrentRevisionProxy != null ? weakCurrentRevisionProxy.get() : null;

        // cache the current revision
        String currentRevisionID = document.getCurrentRevisionId();
        if (currentRevisionProxy == null || !currentRevisionProxy.getRevisionID().equals(currentRevisionID)) {
            SavedRevision revision = document.getCurrentRevision();
            currentRevisionProxy = revision != null ? new SavedRevisionProxy(this, revision) : null;
            weakCurrentRevisionProxy = new WeakReference<SavedRevisionProxy>(currentRevisionProxy);
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
        if (document.getCurrentRevision() != null) {
            return TypePreprocessor.toKrollDict(document.getProperties());
        }
        else return null;
    }

    @Kroll.method
    public Object getProperty(String key) {
        if (document.getCurrentRevision() != null) {
            return TypePreprocessor.preprocess(document.getProperty(key));
        }
        else return null;
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
            SavedRevisionProxy currentRevisionProxy = new SavedRevisionProxy(this, revision);
            weakCurrentRevisionProxy = new WeakReference<SavedRevisionProxy>(currentRevisionProxy);
            return currentRevisionProxy;
        }
        catch (CouchbaseLiteException e) {
            lastError = TitouchdbModule.convertStatusToErrorDict(e.getCBLStatus());
        }
        return null;
    }

}
