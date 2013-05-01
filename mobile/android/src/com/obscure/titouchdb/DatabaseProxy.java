package com.obscure.titouchdb;

import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import android.util.Log;

import com.couchbase.touchdb.TDDatabase;
import com.couchbase.touchdb.TDStatus;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class DatabaseProxy extends KrollProxy {

    private static final String        LCAT               = "DatabaseProxy";

    private KrollDict                  lastError;

    private TDDatabase                 database           = null;

    private Map<String, DocumentProxy> documentProxyCache = new HashMap<String, DocumentProxy>();

    public DatabaseProxy(TDDatabase database) {
        assert database != null;
        this.database = database;
    }

    @Kroll.getProperty(name = "name")
    public String getName() {
        return database.getName();
    }

    @Kroll.getProperty(name = "lastSequenceNumber")
    public Long getLastSequenceNumber() {
        return database.getLastSequence();
    }

    @Kroll.getProperty(name = "documentCount")
    public Integer getDocumentCount() {
        return database.getDocumentCount();
    }

    @Kroll.method
    public boolean compact() {
        TDStatus status = database.compact();
        return status != null && status.isSuccessful();
    }

    @Kroll.method
    public boolean deleteDatabase() {
        return database.deleteDatabase();
    }

    @Kroll.method
    public DocumentProxy documentWithID(@Kroll.argument(optional=true) String docid) {
        if (docid == null || docid.length() < 1) {
            docid = TDDatabase.generateDocumentId();
        }

        DocumentProxy result = documentProxyCache.get(docid);
        if (result == null) {
            result = new DocumentProxy(this.database, docid);
            documentProxyCache.put(docid, result);
        }
        return result;
    }

    @Kroll.getProperty(name = "lastError")
    public KrollDict getLastError() {
        return this.lastError;
    }

    @Kroll.method
    public DocumentProxy untitledDocument() {
        return documentWithID(TDDatabase.generateDocumentId());
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
    public QueryProxy queryAllDocuments() {
        return new QueryProxy(this.database, null);
    }

    @Kroll.method
    public QueryProxy slowQueryWithMap(KrollFunction map) {
        return null;
    }

    @Kroll.method
    public ViewProxy viewNamed(String name) {
        return null;
    }

    @Kroll.method
    public void defineValidation(String name, KrollFunction validation) {

    }

    @Kroll.method
    public void defineFilter(String name, KrollFunction filter) {

    }

    @Kroll.method
    public ReplicationProxy pushToURL(String url) {
        return null;
    }

    @Kroll.method
    public ReplicationProxy pullFromURL(String url) {
        return null;
    }

    @Kroll.method
    public ReplicationProxy[] replicateWithURL(String url) {
        return null;
    }

    @Kroll.getProperty(name = "internalURL")
    public URL getInternalURL() {
        return null;
    }

    // TODO change notifications
}
