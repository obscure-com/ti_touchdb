package com.obscure.titouchdb;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.kroll.common.AsyncResult;
import org.appcelerator.kroll.common.TiMessenger;
import org.appcelerator.titanium.TiApplication;

import android.os.Message;
import android.util.Log;

import com.couchbase.lite.CouchbaseLiteException;
import com.couchbase.lite.Database;
import com.couchbase.lite.Database.ChangeEvent;
import com.couchbase.lite.Database.ChangeListener;
import com.couchbase.lite.Manager;
import com.couchbase.lite.Revision;
import com.couchbase.lite.Validator;
import com.couchbase.lite.View;
import com.couchbase.lite.replicator.Puller;
import com.couchbase.lite.replicator.Pusher;
import com.couchbase.lite.replicator.Replication;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class DatabaseProxy extends KrollProxy implements ChangeListener {

    private static final String        LCAT                       = "DatabaseProxy";

    private static final int           MSG_FIRST_ID               = KrollProxy.MSG_LAST_ID + 1;

    private static final int           MSG_HANDLE_DATABASE_CHANGE = MSG_FIRST_ID + 1200;

    private Database                database                   = null;

    private Map<String, DocumentProxy> documentProxyCache         = new HashMap<String, DocumentProxy>();

    private KrollDict                  lastError;

    private Manager                  manager                     = null;

    private Map<String, ViewProxy>     viewProxyCache             = new HashMap<String, ViewProxy>();

    public DatabaseProxy(Manager manager, Database database) {
        assert manager != null;
        assert database != null;
        this.manager = manager;
        this.database = database;

        database.addChangeListener(this);
    }

    @Kroll.method
    public DocumentProxy cachedDocumentWithID(String docid) {
        return this.documentWithID(docid);
    }

    @Kroll.method
    public void clearDocumentCache() {
        // noop on android
    }

    @Kroll.method
    public void compact() {
        try {
            database.compact();
        }
        catch (CouchbaseLiteException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    @Kroll.method
    public void defineFilter(String name, @Kroll.argument(optional = true) KrollFunction filter) {
        database.setFilter(name, filter != null ? new KrollReplicationFilter(filter) : null);
    }

    @Kroll.method
    public void defineValidation(String name, @Kroll.argument(optional = true) KrollFunction validation) {
        Validator validator = null;
        if (validation != null) {
            validator = new KrollValidator(this, validation);
        }
        database.setValidation(name, validator);
    }

    @Kroll.method
    public void deleteDatabase() {
        try {
            database.delete();
        }
        catch (CouchbaseLiteException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    @Kroll.method
    public DocumentProxy documentWithID(@Kroll.argument(optional = true) String docid) {
        if (docid == null || docid.length() < 1) {
            docid = Database.generateDocumentId();
        }

        DocumentProxy result = documentProxyCache.get(docid);
        if (result == null) {
            result = new DocumentProxy(this.database, docid);
            documentProxyCache.put(docid, result);
        }
        return result;
    }

    @Kroll.getProperty(name = "documentCount")
    public Integer getDocumentCount() {
        return database.getDocumentCount();
    }

    @Kroll.getProperty(name = "internalURL")
    public URL getInternalURL() {
        return null;
    }

    @Kroll.getProperty(name = "lastError")
    public KrollDict getLastError() {
        return this.lastError;
    }

    @Kroll.getProperty(name = "lastSequenceNumber")
    public Long getLastSequenceNumber() {
        return database.getLastSequenceNumber();
    }

    @Kroll.getProperty(name = "name")
    public String getName() {
        return database.getName();
    }

    @SuppressWarnings("unchecked")
    private void handleDatabaseChange(Object arg) {
        // database change notification is { "rev": Revision, "seq": int }
        Map<String, Object> change = (Map<String, Object>) arg;
        KrollDict params = new KrollDict();
        params.put("seq", change.get("seq"));
        params.put("rev", new ReadOnlyRevisionProxy((Revision) change.get("rev")));
        fireEvent("change", params);
    }

    @Override
    public boolean handleMessage(Message msg) {
        switch (msg.what) {
        case MSG_HANDLE_DATABASE_CHANGE:
            AsyncResult result = (AsyncResult) msg.obj;
            handleDatabaseChange(result.getArg());
            result.setResult(null);
        default: {
            return super.handleMessage(msg);
        }
        }
    }

    private View makeAnonymousView() {
        for (int i = 0; true; i++) {
            String name = String.format("$anon$%s", i);
            if (database.getView(name) == null) {
                return database.getView(name);
            }
        }
        // TODO what happens to all of these anonymous views?
    }

    @Kroll.method
    public ReplicationProxy pullFromURL(String url) {
        try {
            Replication pull = database.getReplicator(url);
            if (pull == null) {
                pull = new Puller(database, new URL(url), false, manager.getWorkExecutor());
            }
            return new ReplicationProxy(pull);
        }
        catch (MalformedURLException e) {
            Log.e(LCAT, "malformed pull replication URL: " + url);
        }
        return null;
    }

    @Kroll.method
    public ReplicationProxy pushToURL(String url) {
        try {
            Replication push = database.getReplicator(url);
            if (push == null) {
                push = new Pusher(database, new URL(url), false, manager.getWorkExecutor());
            }
            return new ReplicationProxy(push);
        }
        catch (MalformedURLException e) {
            Log.e(LCAT, "malformed push replication URL: " + url);
        }
        return null;
    }

    @Kroll.method
    public QueryProxy queryAllDocuments() {
        return new QueryProxy(this.database, null);
    }

    @Kroll.method
    public ReplicationProxy[] replicateWithURL(String url, @Kroll.argument(optional = true) boolean exclusive) {
        try {
            if (exclusive) {
                // stop and clear old replications
                for (Boolean b : new Boolean[] { true, false }) {
                    Replication pull = database.getReplicator(url);
                    if (pull != null) {
                        pull.stop();
                        database.getActiveReplications().remove(pull);
                    }
                }
            }
            return new ReplicationProxy[] { pushToURL(url), pullFromURL(url) };
        }
        catch (Exception e) {
            Log.e(LCAT, "malformed replication URL: " + url);
        }
        return null;
    }

    @Kroll.method
    public QueryProxy slowQueryWithMap(KrollFunction map) {
        View view = makeAnonymousView();
        view.setMapReduce(new KrollMapper(map), null, "1");
        return new QueryProxy(this.database, view.getName());
    }

    @Kroll.method
    public DocumentProxy untitledDocument() {
        return documentWithID(Database.generateDocumentId());
    }

    @Kroll.method
    public ViewProxy viewNamed(String name) {
        if (!viewProxyCache.containsKey(name)) {
            View view = database.getView(name);
            if (view != null) {
                viewProxyCache.put(name, new ViewProxy(view));
            }
        }
        return viewProxyCache.get(name);
    }

    @Override
    public void changed(ChangeEvent e) {
        if (!TiApplication.isUIThread()) {
            TiMessenger.sendBlockingMainMessage(getMainHandler().obtainMessage(MSG_HANDLE_DATABASE_CHANGE), e);
        }
        else {
            handleDatabaseChange(e);
        }
    }
}
