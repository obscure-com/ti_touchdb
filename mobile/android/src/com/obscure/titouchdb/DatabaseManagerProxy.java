package com.obscure.titouchdb;

import java.io.IOException;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import android.app.Activity;
import android.util.Log;

import com.couchbase.touchdb.TDDatabase;
import com.couchbase.touchdb.TDServer;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class DatabaseManagerProxy extends KrollProxy {

    private static final String[]      EMPTY_STRING_ARRAY = new String[0];

    public static final String         LCAT               = "DatabaseManagerProxy";

    private KrollDict                  lastError          = null;

    private TDServer                   server             = null;

    private Map<String, DatabaseProxy> databaseProxyCache = new HashMap<String, DatabaseProxy>();
    
    private static final String DATABASE_NAME = "^[a-zA-Z][a-zA-Z0-9_$\\(\\)\\+\\-\\/]*";

    public DatabaseManagerProxy(Activity activity) {
        assert activity != null;
        try {
            server = new TDServer(activity.getFilesDir().getAbsolutePath());
        }
        catch (IOException e) {
            Log.e(LCAT, "Unable to create TDServer", e);
        }
    }

    public DatabaseProxy getCachedDatabaseNamed(String name, boolean create) {
        if (server == null) return null;
        lastError = null;
        
        // check validity of name and set the error object if there is a problem
        if (name == null || name.length() < 1 || !Pattern.matches(DATABASE_NAME, name)) {
            lastError = TitouchdbModule.generateErrorDict(100, "TouchDB", String.format("could not create database '%s'", name));
            return null;
        }
        
        DatabaseProxy result = databaseProxyCache.get(name);
        if (result == null) {
            TDDatabase db = server.getDatabaseNamed(name, create);
            if (db != null && db.open()) {
                result = new DatabaseProxy(db);
                databaseProxyCache.put(name, result);
            }
        }
        return databaseProxyCache.get(name);
    }
    
    @Kroll.method
    public DatabaseProxy createDatabaseNamed(String name) {
        return getCachedDatabaseNamed(name, true);
    }

    @Kroll.method
    public DatabaseProxy databaseNamed(String name) {
        return getCachedDatabaseNamed(name, false);
    }

    @Kroll.getProperty(name = "allDatabaseNames")
    public String[] getAllDatabaseNames() {
        lastError = null;

        List<String> names = server.allDatabaseNames();
        return names != null ? names.toArray(EMPTY_STRING_ARRAY) : EMPTY_STRING_ARRAY;
    }

    @Kroll.getProperty(name = "internalURL")
    public URL getInternalURL() {
        lastError = null;
        // TODO
        return null;
    }

    @Kroll.getProperty(name = "error")
    public KrollDict getLastError() {
        return this.lastError;
    }

    @Kroll.method
    public boolean installDatabase(String name, String pathToDatabase, String pathToAttachments) {
        lastError = null;
        // TODO
        return false;
    }
}
