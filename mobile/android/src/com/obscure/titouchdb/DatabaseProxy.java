package com.obscure.titouchdb;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollEventCallback;
import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.lite.AsyncTask;
import com.couchbase.lite.CouchbaseLiteException;
import com.couchbase.lite.Database;
import com.couchbase.lite.Database.ChangeEvent;
import com.couchbase.lite.Database.ChangeListener;
import com.couchbase.lite.Document;
import com.couchbase.lite.TransactionalTask;
import com.couchbase.lite.View;
import com.couchbase.lite.replicator.Replication;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class DatabaseProxy extends KrollProxy implements ChangeListener {

    private static final String        LCAT                       = "DatabaseProxy";

    private static final int           MSG_FIRST_ID               = KrollProxy.MSG_LAST_ID + 1;

    private static final int           MSG_HANDLE_DATABASE_CHANGE = MSG_FIRST_ID + 1200;

    private Database                   database                   = null;

    private Map<String, DocumentProxy> documentProxyCache         = new HashMap<String, DocumentProxy>();

    private Map<String, ReplicationFilterProxy> filterCallbackCache = new HashMap<String, ReplicationFilterProxy>();

    private KrollDict                  lastError;

    private DatabaseManagerProxy       managerProxy               = null;

    private Map<String, KrollValidator> validationCallbackCache = new HashMap<String, KrollValidator>();

    private Map<String, ViewProxy>     viewProxyCache             = new HashMap<String, ViewProxy>();

    public DatabaseProxy(DatabaseManagerProxy managerProxy, Database database) {
        assert managerProxy != null;
        assert database != null;
        this.managerProxy = managerProxy;
        this.database = database;

        database.addChangeListener(this);
    }

    @Kroll.method
    public void addChangeListener(KrollEventCallback cb) {
        // TODO
    }

    @Override
    public void changed(ChangeEvent e) {
        // TODO Auto-generated method stub
    }

    @Kroll.method
    public boolean compact() {
        try {
            database.compact();
        }
        catch (CouchbaseLiteException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
            return false;
        }
        return true;
    }

    @Kroll.method
    public QueryProxy createAllDocumentsQuery() {
        return new QueryProxy(this, database.createAllDocumentsQuery());
    }

    @Kroll.method
    public DocumentProxy createDocument() {
        return new DocumentProxy(this, database.createDocument());
    }

    @Kroll.method
    public ReplicationProxy createPullReplication(String url) {
        ReplicationProxy result = null;
        try {
            Replication replication = database.createPullReplication(new URL(url));
            result = new ReplicationProxy(replication);
        }
        catch (MalformedURLException e) {
            // TODO set error
        }
        return result;
    }

    @Kroll.method
    public ReplicationProxy createPushReplication(String url) {
        ReplicationProxy result = null;
        try {
            Replication replication = database.createPushReplication(new URL(url));
            result = new ReplicationProxy(replication);
        }
        catch (MalformedURLException e) {
            // TODO set error
        }
        return result;
    }

    @Kroll.method
    public boolean deleteDatabase() {
        try {
            database.delete();
            return true;
        }
        catch (CouchbaseLiteException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return false;
    }
    
    protected void removeDocumentFromCache(String id) {
        documentProxyCache.remove(id);
    }

    @Kroll.method
    public void deleteLocalDocument(String id) {
        try {
            database.deleteLocalDocument(id);
        }
        catch (CouchbaseLiteException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    @Kroll.getProperty(name = "allReplications")
    public ReplicationProxy[] getAllReplications() {
        List<ReplicationProxy> proxies = new ArrayList<ReplicationProxy>();
        for (Replication replication : database.getAllReplications()) {
            proxies.add(new ReplicationProxy(replication));
        }
        return proxies.toArray(new ReplicationProxy[0]);
    }

    protected Database getDatabase() {
        return database;
    }

    @Kroll.method
    public DocumentProxy getDocument(String id) {
        DocumentProxy proxy = documentProxyCache.get(id);
        if (proxy == null) {
            proxy = new DocumentProxy(this, database.getDocument(id));
            documentProxyCache.put(id,  proxy);
        }
        return documentProxyCache.get(id);
    }

    @Kroll.getProperty(name = "documentCount")
    public Integer getDocumentCount() {
        return database.getDocumentCount();
    }

    @Kroll.method
    public DocumentProxy getExistingDocument(String id) {
        DocumentProxy proxy = documentProxyCache.get(id);
        if (proxy == null) {
            Document doc = database.getExistingDocument(id);
            if (doc == null) {
                return null;
            }
            documentProxyCache.put(id,  new DocumentProxy(this, doc));
        }
        return documentProxyCache.get(id);
    }

    @Kroll.method
    public KrollDict getExistingLocalDocument(String id) {
        Map<String, Object> doc = database.getExistingLocalDocument(id);
        return doc != null ? new KrollDict(doc) : null;
    }

    @Kroll.method
    public ViewProxy getExistingView(String name) {
        View view = database.getExistingView(name);
        return view != null ? new ViewProxy(this, view) : null;
    }

    @Kroll.method
    public KrollFunction getFilter(String name) {
        return filterCallbackCache.get(name).getKrollFunction();
    }

    @Kroll.getProperty(name = "lastSequenceNumber")
    public Long getLastSequenceNumber() {
        return database.getLastSequenceNumber();
    }

    @Kroll.getProperty(name = "manager")
    public DatabaseManagerProxy getManager() {
        return managerProxy;
    }

    @Kroll.getProperty(name = "name")
    public String getName() {
        return database.getName();
    }

    @Kroll.method
    public KrollFunction getValidation(String name) {
        return validationCallbackCache.get(name).getKrollFunction();
    }

    @Kroll.method
    public ViewProxy getView(String name) {
        return new ViewProxy(this, database.getView(name));
    }

    @Kroll.method
    public void putLocalDocument(String id, KrollDict doc) {
        try {
            database.putLocalDocument(id, doc);
        }
        catch (CouchbaseLiteException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    @Kroll.method
    public void removeChangeListener(KrollEventCallback cb) {
        // TODO
    }

    @Kroll.method
    public void runAsync(final KrollFunction f) {
        database.runAsync(new AsyncTask() {

            @Override
            public void run(Database db) {
                f.call(null, new Object[] { new DatabaseProxy(managerProxy, db) });
            }

        });
    }

    @Kroll.method
    public void runInTransaction(final KrollFunction f) {
        database.runInTransaction(new TransactionalTask() {

            @Override
            public boolean run() {
                f.call(null, new Object[0]);
                return true; // TODO get truthy return value from call
            }

        });
    }

    @Kroll.method
    public void setFilter(String name, KrollFunction f) {
        ReplicationFilterProxy filter = new ReplicationFilterProxy(this, f);
        database.setFilter(name, filter);
        filterCallbackCache.put(name, filter);
    }

    @Kroll.method
    public void setValidation(String name, KrollFunction f) {
        KrollValidator validator = new KrollValidator(this, f);
        database.setValidation(name, validator);
        validationCallbackCache.put(name, validator);
    }

}
