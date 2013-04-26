package com.obscure.titouchdb;

import java.net.URL;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiContext;

public class TDReplicationProxy extends KrollProxy {

    private KrollDict lastError = null;
    
    public TDReplicationProxy(TiContext tiContext) {
        super(tiContext);
        // TODO Auto-generated constructor stub
    }

    @Kroll.getProperty(name="remoteURL")
    public URL getRemoteURL() {
        return null;
    }
    
    @Kroll.getProperty(name="pull")
    public boolean getPull() {
        return false;
    }
    
    @Kroll.getProperty(name="persistent")
    public boolean getPersistent() {
        return false;
    }
    
    @Kroll.setProperty(name="persistent")
    public void setPersistent(boolean persistent) {
        
    }
    
    @Kroll.getProperty(name="create_target")
    public boolean getCreateTarget() {
        return false;
    }
    
    @Kroll.setProperty(name="create_target")
    public void setCreateTarget(boolean createTarget) {
        
    }
    
    @Kroll.getProperty(name="continuous")
    public boolean getContinuous() {
        return false;
    }
    
    @Kroll.setProperty(name="continuous")
    public void setContinuous(boolean continuous) {
        
    }
    
    @Kroll.getProperty(name="filter")
    public String getFilter() {
        return null;
    }
    
    @Kroll.setProperty(name="filter")
    public void setFilter(String filter) {
        
    }
    
    @Kroll.getProperty(name="query_params")
    public KrollDict getQueryParams() {
        return null;
    }
    
    @Kroll.setProperty(name="query_params")
    public void setQueryParams(KrollDict queryParams) {
        
    }
    
    @Kroll.getProperty(name="doc_ids")
    public String[] getDocIDs() {
        return null;
    }
    
    @Kroll.setProperty(name="doc_ids")
    public void setDocIDs(KrollDict docIDs) {
        
    }
    
    @Kroll.getProperty(name="headers")
    public KrollDict getHeaders() {
        return null;
    }
    
    @Kroll.setProperty(name="headers")
    public void setHeaders(KrollDict headers) {
        
    }
    
    @Kroll.method
    public void start() {
        
    }
    
    @Kroll.method
    public void stop() {
        
    }
    
    @Kroll.getProperty(name="running")
    public boolean getRunning() {
        return false;
    }

    @Kroll.getProperty(name="completed")
    public int getCompleted() {
        return 0;
    }

    @Kroll.getProperty(name="total")
    public int getTotal() {
        return 0;
    }

    @Kroll.getProperty(name="error")
    public KrollDict getError() {
        return lastError;
    }

    @Kroll.getProperty(name="mode")
    public int getMode() {
        return 0;
    }

    // TODO change notifications

}