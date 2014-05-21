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

    private Database                     database;
    
    private Document document;

    private KrollDict                    lastError                  = null;

    public DocumentProxy(Database database, String docid) {
        assert database != null;
        assert docid != null;

        this.database = database;
        this.document = database.getDocument(docid);
    }

    @Kroll.method
    public boolean deleteDocument() {
        try {
        return document.delete();
        }
        catch (CouchbaseLiteException e) {
            // TODO
        }
        return false;
    }

    @Kroll.getProperty(name = "abbreviatedID")
    public String getAbbreviatedID() {
        // TODO
        return null;
//        return this.docid.length() > 10 ? this.docid.substring(0, 4) + ".." + this.docid.substring(this.docid.length() - 4) : this.docid;
    }

    @Kroll.getProperty(name = "currentRevision")
    public RevisionProxy getCurrentRevision() {
        return new RevisionProxy(this, document.getCurrentRevision());
    }

    @Kroll.getProperty(name = "currentRevisionID")
    public String getCurrentRevisionID() {
        return document.getCurrentRevisionId();
    }

    protected Database getDatabase() {
        return database;
    }

    @Kroll.getProperty(name = "documentID")
    public String getDocumentID() {
        return document.getId();
    }

    @Kroll.getProperty(name = "error")
    public KrollDict getError() {
        return lastError;
    }

    @Kroll.method
    public RevisionProxy[] getLeafRevisions() {
        // TODO
        return null;
    }

    @SuppressWarnings("unchecked")
    @Kroll.getProperty(name = "properties")
    public KrollDict getProperties() {
        Map<String, Object> props = (Map<String, Object>) TypePreprocessor.preprocess(document.getProperties());
        return new KrollDict(props);
    }

    @Kroll.method
    public RevisionProxy[] getRevisionHistory() {
        List<RevisionProxy> result = new ArrayList<RevisionProxy>();

        try {
        for (SavedRevision revision : document.getRevisionHistory()) {
            result.add(new RevisionProxy(this, revision));
        }
        }
        catch (CouchbaseLiteException e) {
            // TODO
        }
        
//        List<SavedRevision> history = document.getRevisionHistory();
//
//        // Android is newest-to-oldest; iOS is oldest-to-newest
//        for (int i = history.size() - 1; i >= 0; i--) {
//            Revision rev = history.get(i);
//            Status status = database.loadRevisionBody(rev, EnumSet.of(TDContentOptions.TDIncludeLocalSeq, TDContentOptions.TDIncludeConflicts));
//            result.add(new RevisionProxy(this, history.get(i)));
//        }
        return result.toArray(EMPTY_REVISION_PROXY_ARRAY);
    }

    @Kroll.method
    public RevisionProxy getRevisionWithID(String id) {
        Revision rev = document.getRevision(id);
        return rev != null ? new RevisionProxy(this, rev) : null;
    }

    @Kroll.getProperty(name = "userProperties")
    public KrollDict getUserProperties() {
        KrollDict result = new KrollDict();
        Map<String, Object> props = document.getProperties();
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
    public UnsavedRevisionProxy newRevision() {
        return new UnsavedRevisionProxy(this, document.getCurrentRevision());
    }

    @Kroll.method
    public Object propertyForKey(String key) {
        return document.getProperty(key);
    }

    @Kroll.method
    public boolean purgeDocument() {
        // TODO
        return true;
    }

    @Kroll.method
    @SuppressWarnings({ "rawtypes", "unchecked" })
    public RevisionProxy putProperties(Map properties) {
        this.lastError = null;

        String idprop = properties != null ? (String) properties.get("_id") : null;
        if (idprop != null && !idprop.equals(document.getId())) {
            Log.w(LCAT, String.format("Trying to put wrong _id to %s: %s", this, idprop));
        }

        // TODO null properties means delete?

        String prevRevId = null;
        if (properties != null) {
            prevRevId = (String) properties.get("_rev");
            properties.remove("_rev");
        }

        Revision tostore = document.createRevision();
        tostore.getProperties().putAll(properties);
        
        /*
        
        Status resultStatus = new Status();
        Revision rev = this.database.putRevision(tostore, prevRevId, false, resultStatus);
        if (rev == null) {
            this.lastError = TitouchdbModule.convertStatusToErrorDict(resultStatus);
            Log.w(LCAT, "putRevision failed: " + resultStatus.getCode());
            return null;
        }

        setCurrentRevision(rev);
        */
        return new RevisionProxy(this, tostore);
    }

    /*
    protected Revision putRevision(Revision revision, String prevRevId, boolean allowConflict, Status resultStatus) {
        Revision result = database.putRevision(revision, prevRevId, allowConflict, resultStatus);
        setCurrentRevision(result);
        return result;
    }

    private void setCurrentRevision(Revision rev) {
        this.currentRevision = rev;
    }

    protected Revision updateAttachment(String filename, InputStream contentStream, String contentType) {
        Revision current = getCurrentRevision();
        Status status = new Status();
        Revision result = database.updateAttachment(filename, contentStream, contentType, this.docid, current.getRevId(), status);
        if (!status.isSuccessful()) {
            lastError = TitouchdbModule.convertStatusToErrorDict(status);
            return null;
        }
        return result;
    }
*/
    
    // TODO document changes
}
