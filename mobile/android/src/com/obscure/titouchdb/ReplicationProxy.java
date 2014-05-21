package com.obscure.titouchdb;

import java.util.Observable;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.kroll.common.AsyncResult;
import org.appcelerator.kroll.common.TiMessenger;
import org.appcelerator.titanium.TiApplication;

import android.os.Message;

import com.couchbase.lite.replicator.Pusher;
import com.couchbase.lite.replicator.Replication;
import com.couchbase.lite.replicator.Replication.ChangeEvent;
import com.couchbase.lite.replicator.Replication.ChangeListener;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class ReplicationProxy extends KrollProxy implements ChangeListener {

    private static final String LCAT                          = "ReplicationProxy";

    private static final int    MSG_FIRST_ID                  = KrollProxy.MSG_LAST_ID + 1;

    private static final int    MSG_HANDLE_REPLICATION_UPDATE = MSG_FIRST_ID + 1100;

    private KrollDict           lastError                     = null;

    private Replication       replicator;

    public ReplicationProxy(Replication replicator) {
        assert replicator != null;
        this.replicator = replicator;

        replicator.addChangeListener(this);
    }

    @Kroll.getProperty(name = "completed")
    public int getCompleted() {
        return replicator.getCompletedChangesCount();
    }

    @Kroll.getProperty(name = "continuous")
    public boolean getContinuous() {
        return replicator.isContinuous();
    }

    @Kroll.getProperty(name = "create_target")
    public boolean getCreateTarget() {
        return (replicator instanceof Pusher) ? ((Pusher) replicator).shouldCreateTarget() : false;
    }

    @Kroll.getProperty(name = "doc_ids")
    public String[] getDocIDs() {
        // TODO
        return null;
    }

    @Kroll.getProperty(name = "error")
    public KrollDict getError() {
        return lastError;
    }

    @Kroll.getProperty(name = "filter")
    public String getFilter() {
        return replicator.getFilter();
    }

    @Kroll.getProperty(name = "filterParams")
    public KrollDict getFilterParams() {
        return new KrollDict(replicator.getFilterParams());
    }

    @Kroll.getProperty(name = "headers")
    public KrollDict getHeaders() {
        // TODO
        return null;
    }

    @Kroll.getProperty(name = "mode")
    public int getMode() {
        // TODO idle, offline
        return replicator.isRunning() ? TitouchdbModule.REPLICATION_MODE_ACTIVE : TitouchdbModule.REPLICATION_MODE_STOPPED;
    }

    @Kroll.getProperty(name = "persistent")
    public boolean getPersistent() {
        // TODO
        return false;
    }

    @Kroll.getProperty(name = "pull")
    public boolean getPull() {
        return replicator.isPull();
    }

    @Kroll.getProperty(name = "remoteURL")
    public String getRemoteURL() {
        return replicator.getRemoteUrl().toString();
    }

    @Kroll.getProperty(name = "running")
    public boolean getRunning() {
        return replicator.isRunning();
    }

    @Kroll.getProperty(name = "total")
    public int getTotal() {
        return replicator.getChangesCount();
    }

    @Override
    public boolean handleMessage(Message msg) {
        switch (msg.what) {
        case MSG_HANDLE_REPLICATION_UPDATE:
            AsyncResult result = (AsyncResult) msg.obj;
            handleReplicationUpdate(result.getArg());
            result.setResult(null);
        default: {
            return super.handleMessage(msg);
        }
        }
    }

    private void handleReplicationUpdate(Object arg) {
        fireEvent("change", arg);
    }

    @Kroll.setProperty(name = "continuous")
    public void setContinuous(boolean continuous) {
        replicator.setContinuous(continuous);
    }

    @Kroll.setProperty(name = "create_target")
    public void setCreateTarget(boolean createTarget) {
        if (replicator instanceof Pusher) {
            ((Pusher) replicator).setCreateTarget(createTarget);
        }
    }

    @Kroll.setProperty(name = "doc_ids")
    public void setDocIDs(KrollDict docIDs) {
        // TODO
    }

    @Kroll.setProperty(name = "filter")
    public void setFilter(String filter) {
        replicator.setFilter(filter);
    }

    @Kroll.setProperty(name = "filterParams")
    public void setFilterParams(KrollDict params) {
        replicator.setFilterParams(params);
    }

    @Kroll.setProperty(name = "headers")
    public void setHeaders(KrollDict headers) {
        // TODO
    }

    @Kroll.setProperty(name = "persistent")
    public void setPersistent(boolean persistent) {
        // TODO
    }

    @Kroll.method
    public void start() {
        replicator.start();
    }

    @Kroll.method
    public void stop() {
        replicator.stop();
    }

    @Override
    public void changed(ChangeEvent e) {
        if (!TiApplication.isUIThread()) {
            TiMessenger.sendBlockingMainMessage(getMainHandler().obtainMessage(MSG_HANDLE_REPLICATION_UPDATE), e);
        }
        else {
            handleReplicationUpdate(e);
        }
        
    }

}