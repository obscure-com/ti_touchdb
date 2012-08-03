/**
 * $Id$
 * (c) 2012 Paul Mietz Egli
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 */
package com.obscure.titouchdb;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollModule;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiContext;

import android.util.Log;

import com.couchbase.touchdb.TDDatabase;
import com.couchbase.touchdb.TDMisc;
import com.couchbase.touchdb.TDServer;
import com.couchbase.touchdb.TDView;
import com.couchbase.touchdb.TDViewCompiler;
import com.couchbase.touchdb.TouchDBVersion;
import com.couchbase.touchdb.javascript.TDJavaScriptViewCompiler;

@Kroll.module(name = "Titouchdb", id = "com.obscure.titouchdb")
public class TitouchdbModule extends KrollModule {
	public static final String	LCAT						= "TiTouchDB";

	@Kroll.constant
	public static final int		REPLICATION_MODE_ACTIVE		= 3;

	@Kroll.constant
	public static final int		REPLICATION_MODE_IDLE		= 2;

	@Kroll.constant
	public static final int		REPLICATION_MODE_OFFLINE	= 1;

	@Kroll.constant
	public static final int		REPLICATION_MODE_STOPPED	= 0;

	@Kroll.constant
	public static final int		REPLICATION_STATE_COMPLETED	= 2;

	@Kroll.constant
	public static final int		REPLICATION_STATE_ERROR		= 3;

	@Kroll.constant
	public static final int		REPLICATION_STATE_IDLE		= 0;

	@Kroll.constant
	public static final int		REPLICATION_STATE_TRIGGERED	= 1;

	@Kroll.constant
	public static final int		STALE_QUERY_NEVER			= 0;

	@Kroll.constant
	public static final int		STALE_QUERY_OK				= 1;

	@Kroll.constant
	public static final int		STALE_QUERY_UPDATE_AFTER	= 2;

	private TDViewCompiler		compiler;

	private TDServer			server;

	public TitouchdbModule() {
		Log.i(LCAT, "no-arg constructor");
	}

	public TitouchdbModule(String name) {
		super(name);
		Log.i(LCAT, "one-arg constructor: " + name);
	}

	public TitouchdbModule(TiContext tiContext) {
		super(tiContext);

		String path = tiContext.getActivity().getFilesDir().getAbsolutePath();
		try {
			server = new TDServer(path);
		}
		catch (IOException e) {
			Log.e(LCAT, "Unable to create TDServer");
		}

		compiler = new TDJavaScriptViewCompiler();
		TDView.setCompiler(compiler);

		Log.i(LCAT, this.toString() + " loaded");
	}

	@Kroll.getProperty(name = "activeTasks")
	public KrollDict[] activeTasks() {
		return null;
	}

	@Kroll.getProperty(name = "activityPollingInterval")
	public int activityPollingInterval() {
		return 0;
	}

	@Kroll.method
	public CouchDatabaseProxy databaseNamed(String name) {
		TDDatabase db = server.getDatabaseNamed(name);
		return db != null ? new CouchDatabaseProxy(db) : null;
	}

	@Kroll.method
	public String[] generateUUIDs(int count) {
		String[] result = new String[count];
		for (int i = 0; i < count; i++) {
			result[i] = TDMisc.TDCreateUUID();
		}
		return result;
	}

	@Kroll.method
	public CouchDatabaseProxy[] getDatabases() {
		List<CouchDatabaseProxy> proxies = new ArrayList<CouchDatabaseProxy>();
		for (String name : server.allDatabaseNames()) {
			proxies.add(new CouchDatabaseProxy(server.getDatabaseNamed(name)));
		}
		return proxies.toArray(new CouchDatabaseProxy[0]);
	}

	@Kroll.method
	public String getVersion() {
		return TouchDBVersion.TouchDBVersionNumber;
	}

	@Kroll.getProperty(name = "replications")
	public CouchReplicationProxy[] replications() {
		return null;
	}

	@Kroll.setProperty(name = "activityPollingInterval")
	public void setActivityPollingInterval(int val) {

	}

}
