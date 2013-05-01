package com.obscure.titouchdb;

import java.util.EnumSet;
import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollObject;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import android.util.Log;

import com.couchbase.touchdb.TDDatabase;
import com.couchbase.touchdb.TDDatabase.TDContentOptions;
import com.couchbase.touchdb.TDRevision;
import com.couchbase.touchdb.TDRevisionList;
import com.couchbase.touchdb.TDStatus;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class DocumentProxy extends KrollProxy {

    private static final String LCAT      = "DocumentProxy";

    private KrollDict           lastError = null;

    private TDDatabase          database;

    private String              docid;

    public DocumentProxy(TDDatabase database, String docid) {
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

    @Kroll.getProperty(name = "isDeleted")
    public boolean isDeleted() {
        // TODO
        return false;
    }

    @Kroll.method
    public boolean deleteDocument() {
        // TODO
        return true;
    }

    @Kroll.method
    public boolean purgeDocument() {
        // TODO
        return true;
    }

    private TDRevision getCurrentTDRevision() {
        TDRevision result = database.getDocumentWithIDAndRev(this.docid, null, EnumSet.of(TDContentOptions.TDNoBody));
        Log.i(LCAT, "current TDRevision: "+result);
        return result;
    }

    @Kroll.getProperty(name = "currentRevisionID")
    public String getCurrentRevisionID() {
        TDRevision rev = getCurrentTDRevision();
        return rev != null ? rev.getRevId() : null;
    }

    @Kroll.getProperty(name = "currentRevision")
    public RevisionProxy getCurrentRevision() {
        TDRevision rev = getCurrentTDRevision();
        return rev != null ? new RevisionProxy(rev) : null;
    }

    @Kroll.method
    public RevisionProxy getRevisionWithID(String id) {
        return null;
    }

    @Kroll.method
    public RevisionProxy[] getRevisionHistory() {
        return null;
    }

    @Kroll.method
    public RevisionProxy[] getLeafRevisions() {
        return null;
    }

    @Kroll.method
    public RevisionProxy newRevision() {
        return null;
    }

    @Kroll.getProperty(name = "properties")
    public KrollDict getProperties() {
        return null;
    }

    @Kroll.getProperty(name = "userProperties")
    public KrollDict getUserProperties() {
        return null;
    }

    @Kroll.method
    public KrollObject propertyForKey(String key) {
        return null;
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
        
        TDRevision tostore = new TDRevision(this.docid, null, false);
        tostore.setProperties(properties);

        TDStatus resultStatus = new TDStatus();
        TDRevision rev = this.database.putRevision(tostore, prevRevId, false, resultStatus);
        if (rev == null) {
            this.lastError = TitouchdbModule.convertTDStatusToErrorDict(resultStatus);
            Log.w(LCAT, "putRevision failed: "+resultStatus.getCode());
            return null;
        }
        
        return new RevisionProxy(rev);
    }

    // TODO document changes
}
