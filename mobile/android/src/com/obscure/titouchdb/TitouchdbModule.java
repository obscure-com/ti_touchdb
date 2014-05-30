/**
 * $Id$
 * (c) 2012 Paul Mietz Egli
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 */
package com.obscure.titouchdb;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollModule;
import org.appcelerator.kroll.annotations.Kroll;

import android.app.Activity;
import android.util.Log;

import com.couchbase.lite.Query;
import com.couchbase.lite.SavedRevision;
import com.couchbase.lite.Status;

@Kroll.module(name = "Titouchdb", id = "com.obscure.titouchdb")
public class TitouchdbModule extends KrollModule {

    private static final Map<Integer, String> codeToMessage              = new HashMap<Integer, String>();

    public static final SavedRevisionProxy[]  EMPTY_REVISION_PROXY_ARRAY = new SavedRevisionProxy[0];

    public static final String                LCAT                       = "TiTouchDB";

    @Kroll.constant
    public static final int                   QUERY_ALL_DOCS             = Query.AllDocsMode.ALL_DOCS.ordinal();

    @Kroll.constant
    public static final int                   QUERY_INCLUDE_DELETED      = Query.AllDocsMode.INCLUDE_DELETED.ordinal();

    @Kroll.constant
    public static final int                   QUERY_ONLY_CONFLICTS       = Query.AllDocsMode.ONLY_CONFLICTS.ordinal();

    @Kroll.constant
    public static final int                   QUERY_SHOW_CONFLICTS       = Query.AllDocsMode.SHOW_CONFLICTS.ordinal();

    @Kroll.constant
    public static final int                   QUERY_UPDATE_INDEX_AFTER   = Query.IndexUpdateMode.AFTER.ordinal();

    @Kroll.constant
    public static final int                   QUERY_UPDATE_INDEX_BEFORE  = Query.IndexUpdateMode.BEFORE.ordinal();

    @Kroll.constant
    public static final int                   QUERY_UPDATE_INDEX_NEVER   = Query.IndexUpdateMode.NEVER.ordinal();

    @Kroll.constant
    public static final int                   REPLICATION_MODE_ACTIVE    = 3;

    @Kroll.constant
    public static final int                   REPLICATION_MODE_IDLE      = 2;

    @Kroll.constant
    public static final int                   REPLICATION_MODE_OFFLINE   = 1;

    @Kroll.constant
    public static final int                   REPLICATION_MODE_STOPPED   = 0;

    static {
        System.loadLibrary("function-utils");

        codeToMessage.put(Status.BAD_JSON, "Invalid JSON");
        codeToMessage.put(Status.BAD_REQUEST, "bad_request");
        codeToMessage.put(Status.CONFLICT, "conflict");
        codeToMessage.put(Status.CREATED, "created");
        codeToMessage.put(Status.DB_ERROR, "Database error!");
        codeToMessage.put(Status.FORBIDDEN, "forbidden");
        codeToMessage.put(Status.INTERNAL_SERVER_ERROR, "Internal error");
        codeToMessage.put(Status.METHOD_NOT_ALLOWED, "method_not_allowed");
        codeToMessage.put(Status.NOT_ACCEPTABLE, "not_acceptable");
        codeToMessage.put(Status.NOT_FOUND, "not_found");
        codeToMessage.put(Status.NOT_MODIFIED, "not_modified");
        codeToMessage.put(Status.OK, "ok");
        codeToMessage.put(Status.PRECONDITION_FAILED, "precondition_failed");
        codeToMessage.put(Status.UNKNOWN, "unknown");
    }

    protected static KrollDict convertStatusToErrorDict(Status status) {
        return generateErrorDict(status.getCode(), "TiTouchDB", codeToMessage.get(status.getCode()));
    }

    protected static KrollDict generateErrorDict(int code, String domain, String message) {
        KrollDict result = new KrollDict();
        result.put("error", true);
        result.put("code", code);
        result.put("domain", domain);
        result.put("description", message);
        return result;
    }

    public static native void registerGlobalFunction(Object target, String name, String signature);

    public static SavedRevisionProxy[] toRevisionProxyArray(DocumentProxy documentProxy, List<? extends SavedRevision> revisions) {
        if (revisions == null) return EMPTY_REVISION_PROXY_ARRAY;

        List<SavedRevisionProxy> result = new ArrayList<SavedRevisionProxy>();
        for (SavedRevision revision : revisions) {
            result.add(new SavedRevisionProxy(documentProxy, revision));
        }

        return result.toArray(EMPTY_REVISION_PROXY_ARRAY);
    }

    private DatabaseManagerProxy databaseManagerProxy;

    public TitouchdbModule() {
        Log.i(LCAT, this.toString() + " loaded");
    }

    @Kroll.getProperty(name = "databaseManager")
    public DatabaseManagerProxy getDatabaseManager() {
        return this.databaseManagerProxy;
    }

    @Override
    protected void initActivity(Activity activity) {
        super.initActivity(activity);
        this.databaseManagerProxy = new DatabaseManagerProxy(activity);
    }
}
