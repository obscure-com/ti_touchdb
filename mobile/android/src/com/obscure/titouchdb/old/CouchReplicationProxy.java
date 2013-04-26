package com.obscure.titouchdb.old;

import java.util.HashMap;
import java.util.Map;
import java.util.Observable;
import java.util.Observer;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.kroll.common.CurrentActivityListener;
import org.appcelerator.titanium.util.TiUIHelper;

import android.app.Activity;

import com.couchbase.touchdb.replicator.TDReplicator;
import com.obscure.titouchdb.TitouchdbModule;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class CouchReplicationProxy extends KrollProxy implements Observer {

	private static final String	REPLICATOR_PROGRESS_CHANGED	= "progress";

	private static final String	REPLICATOR_PROGRESS_STOPPED	= "stopped";

	private static final String	LCAT						= "CouchReplicationProxy";

	private boolean				continuous;

	private boolean				createTarget;

	private TDReplicator		repl;

	public CouchReplicationProxy(TDReplicator repl) {
		assert repl != null;
		this.repl = repl;
		repl.addObserver(this);
	}

	@Kroll.getProperty(name = "error")
	public KrollDict getError() {
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

	@Kroll.getProperty(name = "pull")
	public boolean getPull() {
		return !repl.isPush();
	}

	@Kroll.getProperty(name = "remoteURL")
	public String getRemoteURL() {
		return repl.getRemote() != null ? repl.getRemote().toString() : null;
	}

	@Kroll.getProperty(name = "status")
	public int getStatus() {
		// TODO real status
	    return 0;
	    /*
		if (isCompleted()) {
			return TitouchdbModule.REPLICATION_STATE_COMPLETED;
		}
		else {
			return TitouchdbModule.REPLICATION_STATE_IDLE;
		}
		*/
	}

	@Kroll.getProperty(name = "total")
	public int getTotal() {
		return repl.getChangesTotal();
	}

	@Kroll.getProperty(name = "completed")
	public boolean isCompleted() {
		return repl.getChangesProcessed() != 0 && repl.getChangesProcessed() == repl.getChangesTotal();
	}

	@Kroll.getProperty(name = "createTarget")
	public boolean isContinuous() {
		return continuous;
	}

	@Kroll.getProperty(name = "createTarget")
	public boolean isCreateTarget() {
		return createTarget;
	}

	@Kroll.getProperty(name = "running")
	public boolean isRunning() {
		return repl.isRunning();
	}

	@Kroll.setProperty(name = "createTarget")
	public void setContinuous(boolean continuous) {
		this.continuous = continuous;
	}

	@Kroll.setProperty(name = "createTarget")
	public void setCreateTarget(boolean createTarget) {
		this.createTarget = createTarget;
	}

	@Kroll.method
	public void start() {
		TiUIHelper.waitForCurrentActivity(new CurrentActivityListener() {
			public void onCurrentActivityReady(Activity activity) {
				final Activity factivity = activity;
				factivity.runOnUiThread(new Runnable() {
					public void run() {
						repl.start();
					}
				});
			}
		});
	}

	@Kroll.method
	public void stop() {
		TiUIHelper.waitForCurrentActivity(new CurrentActivityListener() {
			public void onCurrentActivityReady(Activity activity) {
				final Activity factivity = activity;
				factivity.runOnUiThread(new Runnable() {
					public void run() {
						repl.stop();
					}
				});
			}
		});
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
