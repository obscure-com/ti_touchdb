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
import com.couchbase.lite.QueryOptions;
import com.couchbase.lite.QueryRow;
import com.couchbase.lite.View;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class QueryProxy extends KrollProxy {

    private static final Object[] EMPTY_OBJECT_ARRAY = new Object[0];

    private static final String   LCAT               = "QueryProxy";

    private KrollDict             lastError;

    private Database           database;

    private String                view;

    private QueryOptions       queryOptions       = new QueryOptions();

    public QueryProxy(Database database, String view) {
        assert database != null;

        this.database = database;
        this.view = view;
    }

    @Kroll.getProperty(name = "limit")
    public int getLimit() {
        return queryOptions.getLimit();
    }

    @Kroll.setProperty(name = "limit")
    public void setLimit(int limit) {
        queryOptions.setLimit(limit);
    }

    @Kroll.getProperty(name = "skip")
    public int getSkip() {
        return queryOptions.getSkip();
    }

    @Kroll.setProperty(name = "skip")
    public void setSkip(int skip) {
        queryOptions.setSkip(skip);
    }

    @Kroll.getProperty(name = "descending")
    public boolean getDescending() {
        return queryOptions.isDescending();
    }

    @Kroll.setProperty(name = "descending")
    public void setDescending(boolean descending) {
        queryOptions.setDescending(descending);
    }

    @Kroll.getProperty(name = "startKey")
    public Object getStartKey() {
        return queryOptions.getStartKey();
    }

    @Kroll.setProperty(name = "startKey")
    public void setStartKey(Object startKey) {
        queryOptions.setStartKey(startKey);
    }

    @Kroll.getProperty(name = "endKey")
    public Object getEndKey() {
        return queryOptions.getEndKey();
    }

    @Kroll.setProperty(name = "endKey")
    public void setEndKey(Object endKey) {
        queryOptions.setEndKey(endKey);
    }

    @Kroll.getProperty(name = "startKeyDocID")
    public String getStartKeyDocID() {
        // TODO
        return null;
    }

    @Kroll.setProperty(name = "startKeyDocID")
    public void setStartKeyDocID(String startKeyDocID) {

    }

    @Kroll.getProperty(name = "endKeyDocID")
    public String getEndKeyDocID() {
        // TODO
        return null;
    }

    @Kroll.setProperty(name = "endKeyDocID")
    public void setEndKeyDocID(String endKeyDocID) {

    }

    @Kroll.getProperty(name = "keys")
    public Object[] getKeys() {
        List<Object> result = queryOptions.getKeys();
        return result != null ? result.toArray(EMPTY_OBJECT_ARRAY) : null;
    }

    @Kroll.setProperty(name = "keys")
    public void setKeys(List<Object> keys) {
        if (keys != null) {
            queryOptions.setKeys(new ArrayList<Object>(keys));
        }
    }

    @Kroll.getProperty(name = "groupLevel")
    public int getGroupLevel() {
        return queryOptions.getGroupLevel();
    }

    @Kroll.setProperty(name = "groupLevel")
    public void setGroupLevel(int groupLevel) {
        queryOptions.setGroupLevel(groupLevel);
    }

    @Kroll.getProperty(name = "prefetch")
    public boolean getPrefetch() {
        return queryOptions.isIncludeDocs();
    }

    @Kroll.setProperty(name = "prefetch")
    public void setPrefetch(boolean prefetch) {
        queryOptions.setIncludeDocs(prefetch);
    }

    @Kroll.getProperty(name = "sequences")
    public boolean getSequences() {
        // TODO
        return false;
    }

    @Kroll.setProperty(name = "sequences")
    public void setSequences(int sequences) {
        // TODO
    }

    @Kroll.getProperty(name = "error")
    public KrollDict getError() {
        return lastError;
    }

    @Kroll.method
    @SuppressWarnings("unchecked")
    public QueryEnumeratorProxy rows() {
        List<QueryRow> rows = null;
        try {
        if (view == null) {
            // _all_docs
            rows = (List<QueryRow>) database.getAllDocs(this.queryOptions).get("rows");
        }
        else {
            View v = database.getExistingView(view);
            v.updateIndex();
            /*
            
            if (status == null || !status.isSuccessful()) {
                Log.e(LCAT, "Error updating view: " + view);
                return null;
            }
            */
            rows = v.queryWithOptions(this.queryOptions);
            /*
            if (status == null || !status.isSuccessful()) {
                Log.e(LCAT, "Error getting rows from view: " + view);
                return null;
            }
            */
        }
        }
        catch (CouchbaseLiteException e) {
            // TODO
        }
        return rows != null ? new QueryEnumeratorProxy(database, rows) : null;
    }

    @Kroll.method
    public QueryEnumeratorProxy rowsIfChanged() {
        return null;
    }
}
