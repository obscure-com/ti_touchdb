package com.obscure.titouchdb;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import android.util.Log;

import com.couchbase.lite.CouchbaseLiteException;
import com.couchbase.lite.Database;
import com.couchbase.lite.Document;
import com.couchbase.lite.Revision;
import com.couchbase.lite.SavedRevision;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class DocumentProxy extends KrollProxy {

    private static final RevisionProxy[] EMPTY_REVISION_PROXY_ARRAY = new RevisionProxy[0];

    private static final String          LCAT                       = "DocumentProxy";

    private DatabaseProxy                databaseProxy;

    private Document                     document;

    private KrollDict                    lastError                  = null;

    public DocumentProxy(DatabaseProxy databaseProxy, Document document) {
        assert databaseProxy != null;
        assert document != null;

        this.databaseProxy = databaseProxy;
        this.document = document;
    }

    @Kroll.method
    public RevisionProxy createRevision() {
        return new RevisionProxy(this, document.createRevision());
    }

    @Kroll.method
    public boolean deleteDocument() {
        try {
            databaseProxy.removeDocumentFromCache(document.getId());
            return document.delete();
        }
        catch (CouchbaseLiteException e) {
            // TODO
        }
        return false;
    }

    @Kroll.getProperty(name = "conflictingRevisions")
    public RevisionProxy[] getConflictingRevisions() {
        try {
            return toRevisionProxyArray(document.getConflictingRevisions());
        }
        catch (CouchbaseLiteException e) {
            // TODO set error
        }
        return EMPTY_REVISION_PROXY_ARRAY;
    }

    @Kroll.getProperty(name = "currentRevision")
    public RevisionProxy getCurrentRevision() {
        return new RevisionProxy(this, document.getCurrentRevision());
    }

    @Kroll.getProperty(name = "currentRevisionID")
    public String getCurrentRevisionID() {
        return document.getCurrentRevisionId();
    }

    @Kroll.getProperty(name = "database")
    public DatabaseProxy getDatabaseProxy() {
        return databaseProxy;
    }

    @Kroll.getProperty(name = "documentID")
    public String getDocumentID() {
        return document.getId();
    }

    @Kroll.getProperty(name = "leafRevisions")
    public RevisionProxy[] getLeafRevisions() {
        try {
            return toRevisionProxyArray(document.getLeafRevisions());
        }
        catch (CouchbaseLiteException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return EMPTY_REVISION_PROXY_ARRAY;
    }

    @SuppressWarnings("unchecked")
    @Kroll.getProperty(name = "properties")
    public KrollDict getProperties() {
        Map<String, Object> props = (Map<String, Object>) TypePreprocessor.preprocess(document.getProperties());
        return new KrollDict(props);
    }

    @Kroll.method
    public Object getProperty(String key) {
        return document.getProperty(key);
    }

    @Kroll.method
    public RevisionProxy getRevision(String id) {
        Revision revision = document.getRevision(id);
        return revision != null ? new RevisionProxy(this, revision) : null;
    }

    @Kroll.method
    public RevisionProxy[] getRevisionHistory() {
        try {
            return toRevisionProxyArray(document.getRevisionHistory());
        }
        catch (CouchbaseLiteException e) {
            // TODO
        }

        return EMPTY_REVISION_PROXY_ARRAY;
    }

    @SuppressWarnings("unchecked")
    @Kroll.getProperty(name = "userProperties")
    public KrollDict getUserProperties() {
        KrollDict result = new KrollDict();
        Map<String, Object> props = (Map<String, Object>) TypePreprocessor.preprocess(document.getProperties());
        for (Map.Entry<String, Object> e : props.entrySet()) {
            if (!e.getKey().startsWith("_")) {
                result.put(e.getKey(), e.getValue());
            }
        }
        return result;
    }

    @Kroll.getProperty(name = "deleted")
    public boolean isDeleted() {
        return document.isDeleted();
    }

    @Kroll.method
    public boolean purgeDocument() {
        try {
            document.purge();
            return true;
        }
        catch (CouchbaseLiteException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return false;
    }
    
    @Kroll.getProperty(name = "error")
    public KrollDict getLastError() {
        return this.lastError;
    }

    @Kroll.method
    public RevisionProxy putProperties(KrollDict properties) {
        try {
            Revision revision = document.putProperties(properties);
            return new RevisionProxy(this, revision);
        }
        catch (CouchbaseLiteException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return null;
    }

    private RevisionProxy[] toRevisionProxyArray(List<? extends Revision> revisions) {
        if (revisions == null) return new RevisionProxy[0];
        List<RevisionProxy> result = new ArrayList<RevisionProxy>();
        for (Revision revision : revisions) {
            result.add(new RevisionProxy(this, revision));
        }
        return result.toArray(EMPTY_REVISION_PROXY_ARRAY);
    }

}
