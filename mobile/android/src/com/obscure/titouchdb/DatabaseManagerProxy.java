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

import com.couchbase.lite.CouchbaseLiteException;
import com.couchbase.lite.Database;
import com.couchbase.lite.Manager;
import com.couchbase.lite.Status;
import com.couchbase.lite.android.AndroidContext;
import com.couchbase.lite.listener.LiteListener;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class DatabaseManagerProxy extends KrollProxy {

    public static final int DEFAULT_LISTENER_PORT = 5984;

    private static final String[]      EMPTY_STRING_ARRAY = new String[0];

    public static final String         LCAT               = "DatabaseManagerProxy";

    private Map<String, DatabaseProxy> databaseProxyCache = new HashMap<String, DatabaseProxy>();

    private KrollDict                  lastError          = null;

    private LiteListener               listener;

    private Manager                    manager            = null;

    public DatabaseManagerProxy(Activity activity) {
        assert activity != null;
        try {
            manager = new Manager(new AndroidContext(activity), Manager.DEFAULT_OPTIONS);
        }
        catch (IOException e) {
            Log.e(LCAT, "Unable to create Manager", e);
        }
    }

    @Kroll.method
    public void close() {
        lastError = null;
        manager.close();
    }

    protected void forgetDatabaseProxy(DatabaseProxy proxy) {
        if (proxy != null) {
            databaseProxyCache.remove(proxy.getName());
        }
    }

    @Kroll.getProperty(name = "allDatabaseNames")
    public String[] getAllDatabaseNames() {
        lastError = null;

        List<String> names = manager.getAllDatabaseNames();
        return names != null ? names.toArray(EMPTY_STRING_ARRAY) : EMPTY_STRING_ARRAY;
    }

    private DatabaseProxy getCachedDatabaseNamed(String name, boolean create) {
        if (manager == null) return null;
        lastError = null;

        DatabaseProxy result = databaseProxyCache.get(name);
        if (result == null || !result.getDatabase().isOpen()) {
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
        lastError = null;
        return "file:/" + manager.getContext().getFilesDir().getAbsolutePath();
    }

    @Kroll.getProperty(name = "directory")
    public String getDirectory() {
        lastError = null;
        return "file:/" + manager.getDirectory().getAbsolutePath();
    }

    @Kroll.method
    public DatabaseProxy getExistingDatabase(String name) {
        return getCachedDatabaseNamed(name, false);
    }

    public String getInternalURL() {
        if (listener == null) {
            startListener(null);
        }
        
        // TODO make sure localhost is ok
        return String.format("http://localhost:%d", listener.getListenPort());
    }

    @Kroll.getProperty(name = "error")
    public KrollDict getLastError() {
        return this.lastError;
    }

    protected Manager getManager() {
        return manager;
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

    @Kroll.method
    public KrollDict startListener(@Kroll.argument(optional = true) KrollDict options) {
        if (listener != null) {
            listener.stop();
            listener = null;
        }

        int port = options != null && options.containsKeyAndNotNull("port") ? options.getInt("port") : DEFAULT_LISTENER_PORT;

        listener = new LiteListener(manager, port, null);
        listener.start();

        int status = listener.serverStatus();
        if (status == 0) {
            return null;
        }

        KrollDict error = new KrollDict();
        error.put("status", status);
        switch (status) {
        case 1:
            error.put("message", "IO error during start");
            break;
        case 2:
            error.put("message", "unexpected error");
            break;
        case 3:
            error.put("message", "could not bind to port " + listener.getListenPort());
            break;
        case -1:
            error.put("message", "error opening socket " + listener.getListenPort());
            break;
        case -2:
            error.put("message", "listener is already running");
            break;
        case -3:
            error.put("message", "listener did not start correctly");
            break;
        }

        return error;
    }

    @Kroll.method
    public void stopListener() {
        if (listener != null) {
            listener.stop();
            listener = null;
        }
    }
}
