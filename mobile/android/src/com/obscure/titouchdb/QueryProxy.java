package com.obscure.titouchdb;

import java.util.Arrays;
import java.util.List;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import android.util.Log;

import com.couchbase.lite.CouchbaseLiteException;
import com.couchbase.lite.Query;
import com.couchbase.lite.Query.AllDocsMode;
import com.couchbase.lite.Query.IndexUpdateMode;
import com.couchbase.lite.QueryEnumerator;
import com.couchbase.lite.Status;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class QueryProxy extends KrollProxy {

    private static final Object[] EMPTY_OBJECT_ARRAY = new Object[0];

    private static final String   LCAT               = "QueryProxy";

    private DatabaseProxy         databaseProxy;

    private KrollDict             lastError;

    private Query                 query;

    public QueryProxy(DatabaseProxy databaseProxy, Query query) {
        assert databaseProxy != null;
        assert query != null;

        this.databaseProxy = databaseProxy;
        this.query = query;
    }

    @Kroll.getProperty(name = "allDocsMode")
    public int getAllDocsMode() {
        return query.getAllDocsMode().ordinal();
    }

    @Kroll.getProperty(name = "database")
    public DatabaseProxy getDatabase() {
        return databaseProxy;
    }

    @Kroll.getProperty(name = "descending")
    public boolean getDescending() {
        return query.isDescending();
    }

    @Kroll.getProperty(name = "endKey")
    public Object getEndKey() {
        return query.getEndKey();
    }

    @Kroll.getProperty(name = "endKeyDocID")
    public String getEndKeyDocID() {
        return query.getEndKeyDocId();
    }

    @Kroll.getProperty(name = "error")
    public KrollDict getError() {
        return lastError;
    }

    @Kroll.getProperty(name = "groupLevel")
    public int getGroupLevel() {
        return query.getGroupLevel();
    }

    @Kroll.getProperty(name = "indexUpdateMode")
    public int getIndexUpdateMode() {
        return query.getIndexUpdateMode().ordinal();
    }

    @Kroll.getProperty(name = "keys")
    public Object[] getKeys() {
        List<Object> result = query.getKeys();
        return result != null ? result.toArray(EMPTY_OBJECT_ARRAY) : null;
    }

    @Kroll.getProperty(name = "limit")
    public int getLimit() {
        return query.getLimit();
    }

    @Kroll.getProperty(name = "prefetch")
    public boolean getPrefetch() {
        return query.shouldPrefetch();
    }

    @Kroll.getProperty(name = "skip")
    public int getSkip() {
        return query.getSkip();
    }

    @Kroll.getProperty(name = "startKey")
    public Object getStartKey() {
        return query.getStartKey();
    }

    @Kroll.getProperty(name = "startKeyDocID")
    public String getStartKeyDocID() {
        return query.getStartKeyDocId();
    }

    @Kroll.getProperty(name = "mapOnly")
    public boolean isMapOnly() {
        return query.isMapOnly();
    }

    @Kroll.method
    public QueryEnumeratorProxy run() {
        lastError = null;
        try {
            QueryEnumerator enumerator = query.run();
            if (enumerator != null) {
                return new QueryEnumeratorProxy(databaseProxy, enumerator);
            }
            else {
                lastError = TitouchdbModule.generateErrorDict(Status.INTERNAL_SERVER_ERROR, "TiTouchDb", "could not run query");
            }
        }
        catch (CouchbaseLiteException e) {
            lastError = TitouchdbModule.convertStatusToErrorDict(e.getCBLStatus());
        }
        return null;
    }

    @Kroll.setProperty(name = "allDocsMode")
    public void setAllDocsMode(int allDocsMode) {
        query.setAllDocsMode(AllDocsMode.values()[allDocsMode]);
    }

    @Kroll.setProperty(name = "descending")
    public void setDescending(boolean descending) {
        query.setDescending(descending);
    }

    @Kroll.setProperty(name = "endKey")
    public void setEndKey(Object endKey) {
        query.setEndKey(endKey);
    }

    @Kroll.setProperty(name = "endKeyDocID")
    public void setEndKeyDocID(String endKeyDocID) {
        query.setEndKeyDocId(endKeyDocID);
    }

    @Kroll.setProperty(name = "groupLevel")
    public void setGroupLevel(int groupLevel) {
        query.setGroupLevel(groupLevel);
    }

    @Kroll.setProperty(name = "indexUpdateMode")
    public void setIndexUpdateMode(int indexUpdateMode) {
        query.setIndexUpdateMode(IndexUpdateMode.values()[indexUpdateMode]);
    }

    @Kroll.setProperty(name = "keys")
    public void setKeys(Object[] keys) {
        if (keys != null) {
            query.setKeys(Arrays.asList(keys));
        }
    }

    @Kroll.setProperty(name = "limit")
    public void setLimit(int limit) {
        query.setLimit(limit);
    }

    @Kroll.setProperty(name = "mapOnly")
    public void setMapOnly(boolean mapOnly) {
        query.setMapOnly(mapOnly);
    }

    @Kroll.setProperty(name = "prefetch")
    public void setPrefetch(boolean prefetch) {
        query.setPrefetch(prefetch);
    }

    @Kroll.setProperty(name = "skip")
    public void setSkip(int skip) {
        query.setSkip(skip);
    }

    @Kroll.setProperty(name = "startKey")
    public void setStartKey(Object startKey) {
        query.setStartKey(startKey);
    }

    @Kroll.setProperty(name = "startKeyDocID")
    public void setStartKeyDocID(String startKeyDocId) {
        query.setStartKeyDocId(startKeyDocId);
    }

}
