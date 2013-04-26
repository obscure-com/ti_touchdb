package com.obscure.titouchdb;

import java.net.URL;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiContext;

public class DatabaseProxy extends KrollProxy {
    
    private KrollDict lastError;

    public DatabaseProxy(TiContext tiContext) {
        super(tiContext);
        // TODO create native object
    }

    @Kroll.getProperty(name="name")
    public String getName() {
        return null;
    }
    
    @Kroll.getProperty(name="lastSequenceNumber")
    public Long getLastSequenceNumber() {
        return null;
    }
    
    @Kroll.getProperty(name="documentCount")
    public Long getDocumentCount() {
        return null;
    }
    
    @Kroll.method
    public boolean compact() {
        return false;
    }
    
    @Kroll.method
    public boolean deleteDatabase() {
        return false;
    }
    
    @Kroll.method
    public DocumentProxy documentWithID(String docid) {
        return null;
    }
    
    @Kroll.getProperty(name="lastError")
    public KrollDict getLastError() {
        return this.lastError;
    }
    
    @Kroll.method
    public DocumentProxy untitledDocument() {
        return null;
    }
    
    @Kroll.method
    public DocumentProxy cachedDocumentWithID(String docid) {
        return null;
    }
    
    @Kroll.method
    public void clearDocumentCache() {
        
    }
    
    @Kroll.method
    public QueryProxy queryAllDocuments() {
        return null;
    }
    
    @Kroll.method
    public QueryProxy slowQueryWithMap(KrollFunction map) {
        return null;
    }
    
    @Kroll.method
    public TDViewProxy viewNamed(String name) {
        return null;
    }
    
    @Kroll.method
    public void defineValidation(String name, KrollFunction validation) {
        
    }
    
    @Kroll.method
    public void defineFilter(String name, KrollFunction filter) {
        
    }
    
    @Kroll.method
    public TDReplicationProxy pushToURL(String url) {
        return null;
    }
    
    @Kroll.method
    public TDReplicationProxy pullFromURL(String url) {
        return null;
    }
    
    @Kroll.method
    public TDReplicationProxy[] replicateWithURL(String url) {
        return null;
    }
    
    @Kroll.getProperty(name="internalURL")
    public URL getInternalURL() {
        return null;
    }
    
    // TODO change notifications
}
