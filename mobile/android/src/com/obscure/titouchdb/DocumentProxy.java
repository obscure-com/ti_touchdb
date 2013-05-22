package com.obscure.titouchdb;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiBlob;

import android.util.Log;

import com.couchbase.cblite.CBLAttachment;
import com.couchbase.cblite.CBLDatabase;
import com.couchbase.cblite.CBLDatabase.TDContentOptions;
import com.couchbase.cblite.CBLRevision;
import com.couchbase.cblite.CBLStatus;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class DocumentProxy extends KrollProxy {

    private static final String          LCAT                       = "DocumentProxy";

    private static final RevisionProxy[] EMPTY_REVISION_PROXY_ARRAY = new RevisionProxy[0];

    private KrollDict                    lastError                  = null;

    private CBLDatabase                  database;

    private CBLRevision                  currentRevision;

    private String                       docid;

    public DocumentProxy(CBLDatabase database, String docid) {
        assert database != null;
        assert docid != null;

        this.database = database;
        this.docid = docid;
    }

    @Kroll.getProperty(name = "error")
    public KrollDict getError() {
        return lastError;
    }

    @Kroll.getProperty(name = "documentID")
    public String getDocumentID() {
        return this.docid;
    }

    @Kroll.getProperty(name = "abbreviatedID")
    public String getAbbreviatedID() {
        return this.docid.length() > 10 ? this.docid.substring(0, 4) + ".." + this.docid.substring(this.docid.length() - 4) : this.docid;
    }

    @Kroll.getProperty(name = "deleted")
    public boolean isDeleted() {
        CBLRevision rev = getCurrentCBLRevision();
        return rev != null ? rev.isDeleted() : false;
    }

    @Kroll.method
    public boolean deleteDocument() {
        // create and save a new revision with the deleted property set to true
        CBLRevision current = getCurrentCBLRevision();
        CBLRevision rev = new CBLRevision(docid, null, true);
        CBLStatus status = new CBLStatus();
        current = database.putRevision(rev, current != null ? current.getRevId() : null, false, status);
        if (!status.isSuccessful()) {
            lastError = TitouchdbModule.convertCBLStatusToErrorDict(status);
            return false;
        }
        setCurrentCBLRevision(current);
        return true;
    }

    @Kroll.method
    public boolean purgeDocument() {
        // TODO
        return true;
    }

    private void setCurrentCBLRevision(CBLRevision rev) {
        this.currentRevision = rev;
    }

    protected CBLRevision getCurrentCBLRevision() {
        if (currentRevision == null) {
            setCurrentCBLRevision(database.getDocumentWithIDAndRev(this.docid, null, EnumSet.noneOf(TDContentOptions.class)));
        }
        return currentRevision;
    }

    @Kroll.getProperty(name = "currentRevisionID")
    public String getCurrentRevisionID() {
        CBLRevision rev = getCurrentCBLRevision();
        return rev != null ? rev.getRevId() : null;
    }

    @Kroll.getProperty(name = "currentRevision")
    public RevisionProxy getCurrentRevision() {
        CBLRevision rev = getCurrentCBLRevision();
        return rev != null ? new RevisionProxy(this, rev) : null;
    }

    @Kroll.method
    public RevisionProxy getRevisionWithID(String id) {
        CBLRevision rev = database.getDocumentWithIDAndRev(this.docid, id, EnumSet.of(TDContentOptions.TDIncludeConflicts));
        return rev != null ? new RevisionProxy(this, rev) : null;
    }

    @Kroll.method
    public RevisionProxy[] getRevisionHistory() {
        List<CBLRevision> history = database.getRevisionHistory(getCurrentCBLRevision());
        List<RevisionProxy> result = new ArrayList<RevisionProxy>();

        // Android is newest-to-oldest; iOS is oldest-to-newest
        for (int i = history.size() - 1; i >= 0; i--) {
            result.add(new RevisionProxy(this, history.get(i)));
        }
        return result.toArray(EMPTY_REVISION_PROXY_ARRAY);
    }

    @Kroll.method
    public RevisionProxy[] getLeafRevisions() {
        // TODO
        return null;
    }

    @Kroll.method
    public NewRevisionProxy newRevision() {
        return new NewRevisionProxy(this, null, getCurrentCBLRevision());
    }

    @Kroll.getProperty(name = "properties")
    public KrollDict getProperties() {
        CBLRevision rev = getCurrentCBLRevision();
        return rev != null && rev.getProperties() != null ? new KrollDict(rev.getProperties()) : null;
    }

    @Kroll.getProperty(name = "userProperties")
    public KrollDict getUserProperties() {
        CBLRevision rev = getCurrentCBLRevision();
        if (rev == null) {
            return null;
        }
        KrollDict result = new KrollDict();
        Map<String, Object> props = rev.getProperties();
        for (Map.Entry<String, Object> e : props.entrySet()) {
            if (!e.getKey().startsWith("_")) {
                result.put(e.getKey(), e.getValue());
            }
        }
        return result;
    }

    @Kroll.method
    public Object propertyForKey(String key) {
        CBLRevision rev = getCurrentCBLRevision();
        return rev != null && rev.getProperties() != null ? rev.getProperties().get(key) : null;
    }

    @Kroll.method
    @SuppressWarnings({ "rawtypes", "unchecked" })
    public RevisionProxy putProperties(Map properties) {
        this.lastError = null;

        String idprop = properties != null ? (String) properties.get("_id") : null;
        if (idprop != null && !idprop.equals(this.docid)) {
            Log.w(LCAT, String.format("Trying to put wrong _id to %s: %s", this, idprop));
        }

        // TODO attachments

        // TODO null properties means delete?

        String prevRevId = null;
        if (properties != null) {
            prevRevId = (String) properties.get("_rev");
            properties.remove("_rev");
        }

        CBLRevision tostore = new CBLRevision(this.docid, null, false);
        tostore.setProperties(properties);

        CBLStatus resultStatus = new CBLStatus();
        CBLRevision rev = this.database.putRevision(tostore, prevRevId, false, resultStatus);
        if (rev == null) {
            this.lastError = TitouchdbModule.convertCBLStatusToErrorDict(resultStatus);
            Log.w(LCAT, "putRevision failed: " + resultStatus.getCode());
            return null;
        }

        return new RevisionProxy(this, rev);
    }

    protected CBLRevision putRevision(CBLRevision revision, String prevRevId, boolean allowConflict, CBLStatus resultStatus) {
        CBLRevision result = database.putRevision(revision, prevRevId, allowConflict, resultStatus);
        setCurrentCBLRevision(result);
        return result;
    }

    protected AttachmentProxy addAttachment(String name, String contentType, TiBlob content) {
        CBLRevision current = getCurrentCBLRevision();
        long attseq = current.getSequence();
        CBLStatus status = database.insertAttachmentForSequenceWithNameAndType(content.getInputStream(), attseq, name, contentType, current.getGeneration());
        if (status.isSuccessful()) {
            // TODO update to the new revision with the attachment?
            CBLAttachment attachment = database.getAttachmentForSequence(attseq, name, status);
            if (status.isSuccessful()) {
                return new AttachmentProxy(name, attachment, content.getLength());
            }
        }
        
        if (!status.isSuccessful()) {
            lastError = TitouchdbModule.convertCBLStatusToErrorDict(status);
        }
        
        return null;
    }

    // TODO document changes
}
