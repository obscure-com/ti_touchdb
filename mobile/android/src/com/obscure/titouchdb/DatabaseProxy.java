package com.obscure.titouchdb;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.Observable;
import java.util.Observer;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.kroll.common.AsyncResult;
import org.appcelerator.kroll.common.TiMessenger;
import org.appcelerator.titanium.TiApplication;

import android.os.Message;
import android.util.Log;

import com.couchbase.cblite.CBLDatabase;
import com.couchbase.cblite.CBLRevision;
import com.couchbase.cblite.CBLServer;
import com.couchbase.cblite.CBLStatus;
import com.couchbase.cblite.CBLValidationBlock;
import com.couchbase.cblite.CBLView;
import com.couchbase.cblite.replicator.CBLPuller;
import com.couchbase.cblite.replicator.CBLPusher;
import com.couchbase.cblite.replicator.CBLReplicator;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class DatabaseProxy extends KrollProxy implements Observer {

    private static final String        LCAT                       = "DatabaseProxy";

    private static final int           MSG_FIRST_ID               = KrollProxy.MSG_LAST_ID + 1;

    private static final int           MSG_HANDLE_DATABASE_CHANGE = MSG_FIRST_ID + 1200;

    private CBLDatabase                database                   = null;

    private Map<String, DocumentProxy> documentProxyCache         = new HashMap<String, DocumentProxy>();

    private KrollDict                  lastError;

    private CBLServer                  server                     = null;

    private Map<String, ViewProxy>     viewProxyCache             = new HashMap<String, ViewProxy>();

    public DatabaseProxy(CBLServer server, CBLDatabase database) {
        assert server != null;
        assert database != null;
        this.server = server;
        this.database = database;

        database.addObserver(this);
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
    public boolean compact() {
        CBLStatus status = database.compact();
        return status != null && status.isSuccessful();
    }

    @Kroll.method
    public void defineFilter(String name, @Kroll.argument(optional = true) KrollFunction filter) {
        database.defineFilter(name, filter != null ? new KrollFilterBlock(filter) : null);
    }

    @Kroll.method
    public void defineValidation(String name, @Kroll.argument(optional = true) KrollFunction validation) {
        CBLValidationBlock block = null;
        if (validation != null) {
            block = new KrollValidationBlock(this, validation);
        }
        database.defineValidation(name, block);
    }

    @Kroll.method
    public boolean deleteDatabase() {
        return database.deleteDatabase();
    }

    @Kroll.method
    public DocumentProxy documentWithID(@Kroll.argument(optional = true) String docid) {
        if (docid == null || docid.length() < 1) {
            docid = CBLDatabase.generateDocumentId();
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
        return database.getLastSequence();
    }

    @Kroll.getProperty(name = "name")
    public String getName() {
        return database.getName();
    }

    @SuppressWarnings("unchecked")
    private void handleDatabaseChange(Object arg) {
        // database change notification is { "rev": CBLRevision, "seq": int }
        Map<String, Object> change = (Map<String, Object>) arg;
        KrollDict params = new KrollDict();
        params.put("seq", change.get("seq"));
        params.put("rev", new ReadOnlyRevisionProxy((CBLRevision) change.get("rev")));
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

    private CBLView makeAnonymousView() {
        for (int i = 0; true; i++) {
            String name = String.format("$anon$%s", i);
            if (database.getExistingViewNamed(name) == null) {
                return database.getViewNamed(name);
            }
        }
        // TODO what happens to all of these anonymous views?
    }

    @Kroll.method
    public ReplicationProxy pullFromURL(String url) {
        try {
            URL remote = new URL(url);
            CBLReplicator pull = database.getActiveReplicator(remote, false);
            if (pull == null) {
                pull = new CBLPuller(database, new URL(url), false, server.getWorkExecutor());
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
            URL remote = new URL(url);
            CBLReplicator push = database.getActiveReplicator(remote, true);
            if (push == null) {
                push = new CBLPusher(database, remote, false, server.getWorkExecutor());
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
            URL remote = new URL(url);
            if (exclusive) {
                // stop and clear old replications
                for (Boolean b : new Boolean[] { true, false }) {
                    CBLReplicator pull = database.getActiveReplicator(remote, b);
                    if (pull != null) {
                        pull.stop();
                        database.getActiveReplicators().remove(pull);
                    }
                }
            }
            return new ReplicationProxy[] { pushToURL(url), pullFromURL(url) };
        }
        catch (MalformedURLException e) {
            Log.e(LCAT, "malformed replication URL: " + url);
        }
        return null;
    }

    @Kroll.method
    public QueryProxy slowQueryWithMap(KrollFunction map) {
        CBLView view = makeAnonymousView();
        view.setMapReduceBlocks(new KrollViewMapBlock(map), null, "1");
        return new QueryProxy(this.database, view.getName());
    }

    @Kroll.method
    public DocumentProxy untitledDocument() {
        return documentWithID(CBLDatabase.generateDocumentId());
    }

    @Override
    public void update(Observable o, Object arg) {
        if (!TiApplication.isUIThread()) {
            TiMessenger.sendBlockingMainMessage(getMainHandler().obtainMessage(MSG_HANDLE_DATABASE_CHANGE), arg);
        }
        else {
            handleDatabaseChange(arg);
        }
    }

    @Kroll.method
    public ViewProxy viewNamed(String name) {
        if (!viewProxyCache.containsKey(name)) {
            CBLView view = database.getViewNamed(name);
            if (view != null) {
                viewProxyCache.put(name, new ViewProxy(view));
            }
        }
        return viewProxyCache.get(name);
    }
}
