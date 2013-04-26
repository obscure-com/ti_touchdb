package com.obscure.titouchdb;

import java.net.URL;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiContext;

public class DatabaseManagerProxy extends KrollProxy {

    // TODO
    private KrollDict lastError = null;
    
    public DatabaseManagerProxy(TiContext tiContext) {
        super(tiContext);
    }

    @Kroll.method
    public DatabaseProxy databaseNamed(String name) {
        this.lastError = null;
        return null;
    }
    
    @Kroll.method
    public DatabaseProxy createDatabaseNamed(String name) {
        this.lastError = null;
        return null;
    }
    
    @Kroll.method
    public boolean installDatabase(String name, String pathToDatabase, String pathToAttachments) {
        return false;
    }
    
    @Kroll.getProperty(name="allDatabaseNames")
    public String[] getAllDatabaseNames() {
        return null;
    }
    
    @Kroll.getProperty(name="internalURL")
    public URL getInternalURL() {
        return null;
    }
    
    @Kroll.getProperty(name="lastError")
    public KrollDict getLastError() {
        return this.lastError;
    }
}
