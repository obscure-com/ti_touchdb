/**
 * $Id$
 * (c) 2012 Paul Mietz Egli
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 */
package com.obscure.titouchdb;

import java.util.HashMap;
import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollModule;
import org.appcelerator.kroll.annotations.Kroll;

import android.app.Activity;
import android.util.Log;

import com.couchbase.touchdb.TDStatus;

@Kroll.module(name = "Titouchdb", id = "com.obscure.titouchdb")
public class TitouchdbModule extends KrollModule {
    
    private static final Map<Integer,String> codeToMessage = new HashMap<Integer,String>();
    
    public static final String     LCAT = "TiTouchDB";
    
    @Kroll.constant
    public static final int REPLICATION_MODE_ACTIVE = 0;
    
    @Kroll.constant
    public static final int REPLICATION_MODE_IDLE = 0;
    
    @Kroll.constant
    public static final int REPLICATION_MODE_OFFLINE = 0;
    
    @Kroll.constant
    public static final int REPLICATION_MODE_STOPPED = 0;
    
    @Kroll.constant
    public static final int STALE_QUERY_NEVER = 0;

    @Kroll.constant
    public static final int STALE_QUERY_OK = 0;

    @Kroll.constant
    public static final int STALE_QUERY_UPDATE_AFTER = 0;

    static {
        codeToMessage.put(TDStatus.BAD_JSON, "Invalid JSON");
        codeToMessage.put(TDStatus.BAD_REQUEST, "bad_request");
        codeToMessage.put(TDStatus.CONFLICT, "conflict");
        codeToMessage.put(TDStatus.CREATED, "created");
        codeToMessage.put(TDStatus.DB_ERROR, "Database error!");
        codeToMessage.put(TDStatus.FORBIDDEN, "forbidden");
        codeToMessage.put(TDStatus.INTERNAL_SERVER_ERROR, "Internal error");
        codeToMessage.put(TDStatus.METHOD_NOT_ALLOWED, "method_not_allowed");
        codeToMessage.put(TDStatus.NOT_ACCEPTABLE, "not_acceptable");
        codeToMessage.put(TDStatus.NOT_FOUND, "not_found");
        codeToMessage.put(TDStatus.NOT_MODIFIED, "not_modified");
        codeToMessage.put(TDStatus.OK, "ok");
        codeToMessage.put(TDStatus.PRECONDITION_FAILED, "precondition_failed");
        codeToMessage.put(TDStatus.UNKNOWN, "unknown");
    }

    protected static KrollDict convertTDStatusToErrorDict(TDStatus status) {
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
