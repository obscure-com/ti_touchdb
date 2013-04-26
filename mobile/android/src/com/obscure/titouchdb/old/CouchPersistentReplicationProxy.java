package com.obscure.titouchdb.old;

import java.util.HashMap;
import java.util.Map;
import java.util.Observable;
import java.util.Observer;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.touchdb.TDDatabase;
import com.couchbase.touchdb.replicator.TDReplicator;
import com.obscure.titouchdb.TitouchdbModule;

/**
 * TODO this isn't really a persistent replication -- it just fakes it using a
 * regular replication object.
 * 
 * @author Paul Mietz Egli
 * 
 */
@Kroll.proxy(parentModule = TitouchdbModule.class)
public class CouchPersistentReplicationProxy extends KrollProxy implements Observer {

    private static final String LCAT                        = "CouchPersistentReplicationProxy";

    private static final String REPLICATOR_PROGRESS_CHANGED = "progress";

    private static final String REPLICATOR_PROGRESS_STOPPED = "stopped";

    private TDDatabase          db;

    private TDReplicator        repl;

    public CouchPersistentReplicationProxy(TDDatabase db, TDReplicator repl) {
        assert db != null;
        assert repl != null;
        this.db = db;
        this.repl = repl;
        repl.addObserver(this);
    }

    @Kroll.method
    public void actAsAdmin() {
        // TODO
    }

    @Kroll.method
    public void actAsUserWithRoles(String username, String[] roles) {
        // TODO
    }

    @Kroll.getProperty(name = "error")
    public KrollDict getError() {
        // TODO
        return null;
    }

    @Kroll.getProperty(name = "filter")
    public String getFilter() {
        // TODO
        return null;
    }

    @Kroll.getProperty(name = "filterParams")
    public KrollDict getFilterParams() {
        // TODO
        return null;
    }

    @Kroll.getProperty(name = "mode")
    public int getMode() {
        // TODO get actual mode
        if (repl.isRunning()) {
            return TitouchdbModule.REPLICATION_MODE_ACTIVE;
        }
        else {
            return TitouchdbModule.REPLICATION_MODE_STOPPED;
        }
    }

    @Kroll.getProperty(name = "remoteURL")
    public String getRemoteURL() {
        return repl.getRemote().toString();
    }

    @Kroll.getProperty(name = "source")
    public String getSource() {
        return repl.isPush() ? db.getName() : repl.getRemote().toString();
    }

    @Kroll.getProperty(name = "status")
    public int getStatus() {
        // TODO real status
        return 0;
        /*
        if (getCompleted() == getTotal()) {
            return TitouchdbModule.REPLICATION_STATE_COMPLETED;
        }
        else {
            return TitouchdbModule.REPLICATION_STATE_IDLE;
        }
        */
    }

    @Kroll.getProperty(name = "target")
    public String getTarget() {
        return repl.isPush() ? repl.getRemote().toString() : db.getName();
    }

    @Kroll.getProperty(name = "total")
    public int getTotal() {
        return repl.getChangesTotal();
    }

    @Kroll.getProperty(name = "completed")
    public int getCompleted() {
        return repl.getChangesProcessed();
    }

    @Kroll.getProperty(name = "continuous")
    public boolean isContinuous() {
        // TODO
        return false;
    }

    @Kroll.method
    public void restart() {
        // TODO
        repl.stop();
        repl.start();
    }

    @Kroll.setProperty(name = "filter")
    public void setFilter(String filter) {
        // TODO
    }

    @Kroll.setProperty(name = "filterParams")
    public void setFilterParams(KrollDict params) {
        // TODO
    }

    private Map<String, Object> toStatusDictionary() {
        Map<String, Object> result = new HashMap<String, Object>();
        result.put("completed", repl.getChangesProcessed());
        result.put("total", repl.getChangesTotal());
        result.put("status", getStatus());
        result.put("error", getError());
        result.put("running", repl.isRunning());
        return result;
    }

    public void update(Observable observable, Object arg) {
        Map<String, Object> dict = toStatusDictionary();
        if (!repl.isRunning()) {
            this.fireEvent(REPLICATOR_PROGRESS_STOPPED, dict);
        }
        else {
            this.fireEvent(REPLICATOR_PROGRESS_CHANGED, dict);
        }
    }
}
