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
import com.couchbase.touchdb.TouchDBVersion;

@Kroll.module(name = "Titouchdb", id = "com.obscure.titouchdb")
public class TitouchdbModule extends KrollModule {
	public static final String	LCAT	= "TiTouchDB";

	private TDServer			server;

	
	
	public TitouchdbModule() {
		Log.i(LCAT, "no-arg constructor");
	}

	public TitouchdbModule(String name) {
		super(name);
		Log.i(LCAT, "one-arg constructor: "+name);
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

	@Kroll.setProperty(name = "activityPollingInterval")
	public void setActivityPollingInterval(int val) {

	}

	@Kroll.getProperty(name = "replications")
	public CouchReplicationProxy[] replications() {
		return null;
	}

	@Kroll.method
	public String getVersion() {
		return TouchDBVersion.TouchDBVersionNumber;
	}

	@Kroll.method
	public String[] generateUUIDs(int count) {
		String[] result = new String[count];
		for (int i=0; i < count; i++) {
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
	public CouchDatabaseProxy databaseNamed(String name) {
		TDDatabase db = server.getDatabaseNamed(name);
		return db != null ? new CouchDatabaseProxy(db) : null;
	}

}
