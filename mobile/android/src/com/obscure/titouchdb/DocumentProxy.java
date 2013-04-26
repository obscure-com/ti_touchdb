package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollObject;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiContext;

public class DocumentProxy extends KrollProxy {

    private KrollDict lastError = null;
    
    public DocumentProxy(TiContext tiContext) {
        super(tiContext);
        // TODO generate native object
    }

    @Kroll.getProperty(name="error")
    public KrollDict getError() {
        return lastError;
    }
    
    @Kroll.getProperty(name="documentID")
    public String getDocumentID() {
        return null;
    }
    
    @Kroll.getProperty(name="abbreviatedID")
    public String getAbbreviatedID() {
        return null;
    }
    
    @Kroll.getProperty(name="isDeleted")
    public boolean isDeleted() {
        return false;
    }
    
    @Kroll.method
    public boolean deleteDocument() {
        return true;
    }
    
    @Kroll.method
    public boolean purgeDocument() {
        return true;
    }
    
    @Kroll.getProperty(name="currentRevisionID")
    public String getCurrentRevisionID() {
        return null;
    }
    
    @Kroll.getProperty(name="currentRevision")
    public RevisionProxy getCurrentRevision() {
        return null;
    }
    
    @Kroll.method
    public RevisionProxy getRevisionWithID(String id) {
        return null;
    }
    
    @Kroll.method
    public RevisionProxy[] getRevisionHistory() {
        return null;
    }
    
    @Kroll.method
    public RevisionProxy[] getLeafRevisions() {
        return null;
    }
    
    @Kroll.method
    public RevisionProxy newRevision() {
        return null;
    }
    
    @Kroll.getProperty(name="properties")
    public KrollDict getProperties() {
        return null;
    }
    
    @Kroll.getProperty(name="userProperties")
    public KrollDict getUserProperties() {
        return null;
    }
    
    @Kroll.method
    public KrollObject propertyForKey(String key) {
        return null;
    }
    
    @Kroll.method
    public RevisionProxy putProperties(KrollDict properties) {
        return null;
    }
    
    // TODO document changes
}
