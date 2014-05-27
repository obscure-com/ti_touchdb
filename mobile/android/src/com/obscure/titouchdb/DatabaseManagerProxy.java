package com.obscure.titouchdb;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import android.app.Activity;
import android.util.Log;

import com.couchbase.lite.Context;
import com.couchbase.lite.CouchbaseLiteException;
import com.couchbase.lite.Database;
import com.couchbase.lite.Manager;
import com.couchbase.lite.Status;
import com.couchbase.lite.android.AndroidContext;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class DatabaseManagerProxy extends KrollProxy {

    private static final String[]      EMPTY_STRING_ARRAY = new String[0];

    public static final String         LCAT               = "DatabaseManagerProxy";

    private Map<String, DatabaseProxy> databaseProxyCache = new HashMap<String, DatabaseProxy>();

    private KrollDict                  lastError          = null;

    private Manager                    manager            = null;

    public DatabaseManagerProxy(Activity activity) {
        assert activity != null;
        try {
            manager = new Manager(new AndroidContext(activity), Manager.DEFAULT_OPTIONS);
        }
        catch (IOException e) {
            Log.e(LCAT, "Unable to create TDServer", e);
        }
    }
    
    @Kroll.method
    public void close() {
        manager.close();
    }

    @Kroll.getProperty(name = "allDatabaseNames")
    public String[] getAllDatabaseNames() {
        lastError = null;

        List<String> names = manager.getAllDatabaseNames();
        return names != null ? names.toArray(EMPTY_STRING_ARRAY) : EMPTY_STRING_ARRAY;
    }

    public DatabaseProxy getCachedDatabaseNamed(String name, boolean create) {
        if (manager == null) return null;
        lastError = null;

        DatabaseProxy result = databaseProxyCache.get(name);
        if (result == null) {
            try {
                Database db = create ? manager.getDatabase(name) : manager.getExistingDatabase(name);
                if (db != null && db.open()) {
                    result = new DatabaseProxy(this, db);
                    databaseProxyCache.put(name, result);
                }
                else {
                    lastError = TitouchdbModule.generateErrorDict(Status.NOT_FOUND, "TouchDB", String.format("database %s not found", name));
                }
            }
            catch (CouchbaseLiteException e) {
                lastError = TitouchdbModule.generateErrorDict(e.getCBLStatus().getCode(), "TouchDB", String.format("could not get database '%s'", name));
            }
        }
        return databaseProxyCache.get(name);
    }

    @Kroll.method
    public DatabaseProxy getDatabase(String name) {
        return getCachedDatabaseNamed(name, true);
    }

    @Kroll.getProperty(name = "defaultDirectory")
    public String getDefaultDirectory() {
        return "file:/" + manager.getContext().getFilesDir().getAbsolutePath();
    }

    @Kroll.getProperty(name = "directory")
    public String getDirectory() {
        return "file:/" + manager.getDirectory().getAbsolutePath();
    }

    @Kroll.method
    public DatabaseProxy getExistingDatabase(String name) {
        return getCachedDatabaseNamed(name, false);
    }

    @Kroll.getProperty(name = "error")
    public KrollDict getLastError() {
        return this.lastError;
    }

    @Kroll.method
    public boolean installDatabase(String name, String pathToDatabase, String pathToAttachments) {
        lastError = null;
        throw new UnsupportedOperationException("installDatabase not implemented");
    }

    @Kroll.method
    public boolean isValidDatabaseName(String name) {
        return Manager.isValidDatabaseName(name);
    }
}
