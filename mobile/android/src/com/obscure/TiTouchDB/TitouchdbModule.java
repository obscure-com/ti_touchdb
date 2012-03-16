/**
 * $Id$
 * (c) 2012 Paul Mietz Egli
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 */
package com.obscure.TiTouchDB;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollEvaluator;
import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollModule;
import org.appcelerator.kroll.KrollObject;
import org.appcelerator.kroll.KrollRuntime;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.kroll.common.Log;

import android.app.Activity;

import com.couchbase.touchdb.TDDatabase;
import com.couchbase.touchdb.TDServer;
import com.couchbase.touchdb.TDView;
import com.couchbase.touchdb.TDViewCompiler;
import com.couchbase.touchdb.TDViewMapBlock;
import com.couchbase.touchdb.TDViewMapEmitBlock;
import com.couchbase.touchdb.TDViewReduceBlock;

//import com.couchbase.touchdb.listener.TDListener;

@Kroll.module(name = "Titouchdb", id = "com.obscure.TiTouchDB")
public class TitouchdbModule extends KrollModule implements TDViewCompiler {

	private static final String[]		EMPTY_STRING_ARRAY			= new String[0];

	private static TDDatabaseProxy[]	EMPTY_TDDATABASEPROXY_ARRAY	= new TDDatabaseProxy[0];

	private static final String			LCAT						= "TiTouchDB";

	private TDViewMapEmitBlock			currentEmitBlock;

	private KrollEvaluator				evaluator;

	private TDServer					server;

	public TitouchdbModule() {
		super();
	}

	@Kroll.getProperty
	public TDDatabaseProxy[] allOpenDatabases() {
		List<TDDatabaseProxy> result = new ArrayList<TDDatabaseProxy>();
		for (TDDatabase db : server.allOpenDatabases()) {
			result.add(new TDDatabaseProxy(db));
		}
		return result.toArray(EMPTY_TDDATABASEPROXY_ARRAY);
	}

	@Kroll.method
	public void close() {
		server.close();
	}

	public TDViewMapBlock compileMapFunction(String source, String language) {
		if (!"javascript".equalsIgnoreCase(language)) {
			Log.w(LCAT, String.format("cannot compile non-javascript language '%s'", language));
			return null;
		}

		final KrollObject self = this.getKrollObject();
		final KrollFunction fn = (KrollFunction) evaluator.evaluateString(self, source, null);
		return new TDViewMapBlock() {
			public void map(Map<String, Object> doc, TDViewMapEmitBlock emit) {
				currentEmitBlock = emit;

				// KrollFunction why u use concrete type instead of interface?
				HashMap<String, Object> arg = new HashMap<String, Object>(doc);
				fn.call(self, arg);
			}
		};
	}

	public TDViewReduceBlock compileReduceFunction(String source, String language) {
		if (!"javascript".equalsIgnoreCase(language)) {
			Log.w(LCAT, String.format("cannot compile non-javascript language '%s'", language));
			return null;
		}

		final KrollObject self = this.getKrollObject();
		final KrollFunction fn = (KrollFunction) evaluator.evaluateString(self, source, null);
		return new TDViewReduceBlock() {
			public Object reduce(List<Object> keys, List<Object> values, boolean rereduce) {
				return fn.call(self, new Object[] { keys, values, new Boolean(rereduce) });
			}
		};
	}

	/**
	 * Convert object to a form that can be returned from a Kroll method.
	 * Primarily, this means converting Map to KrollDict and List to arrays.
	 * 
	 * @param obj
	 *            the object to convert
	 * @return a Kroll-compatible form of the object
	 */
	@SuppressWarnings({ "unchecked", "rawtypes" })
	public static Object krollify(final Object obj) {
		if (obj == null) {
			return null;
		}
		else if (obj instanceof Map) {
			Map map = (Map) obj;
			for (Object key : map.keySet()) {
				map.put(key, krollify(map.get(key)));
			}
			return new KrollDict(map);
		}
		else if (obj instanceof List) {
			List list = (List) obj;
			for (int i = 0; i < list.size(); i++) {
				list.set(i, krollify(list.get(i)));
			}
			return list.toArray();
		}
		else {
			return obj;
		}
	}

	@Kroll.method
	public TDDatabaseProxy databaseNamed(String name) {
		TDDatabase db = server.getDatabaseNamed(name);
		return db != null ? new TDDatabaseProxy(db) : null;
	}

	@Kroll.method
	public boolean deleteDatabaseNamed(String name) {
		return server.deleteDatabaseNamed(name);
	}

	@Kroll.getProperty
	public String directory() {
		// not implemented in Android TDServer?
		return null;
	}

	@Kroll.method
	@Kroll.topLevel("emit")
	public final void doEmit(Object key, Object value) {
		currentEmitBlock.emit(key, value);
	}

	@Kroll.method
	public TDDatabaseProxy existingDatabaseNamed(String name) {
		TDDatabase db = server.getExistingDatabaseNamed(name);
		return db != null ? new TDDatabaseProxy(db) : null;
	}

	@Kroll.method
	@Kroll.getProperty
	public String[] getAllDatabaseNames() {
		List<String> names = server.allDatabaseNames();
		return names != null ? names.toArray(EMPTY_STRING_ARRAY) : EMPTY_STRING_ARRAY;
	}

	@Override
	protected void initActivity(Activity activity) {
		super.initActivity(activity);
		evaluator = KrollRuntime.getInstance().getEvaluator();
		TDView.setCompiler(this);
		try {
			String filesDir = activity.getFilesDir().getAbsolutePath();
			server = new TDServer(filesDir);
			Log.i(LCAT, "created server");
		}
		catch (IOException e) {
			throw new RuntimeException("Error creating TouchDB server: " + e.getMessage());
		}
	}

	@Kroll.method
	public boolean isValidDatabaseName(String name) {
		// TDServer does not yet implement isValidDatabaseName
		return true;
	}

	@Kroll.method
	public void startListenerOnPort(int port, @Kroll.argument(optional = true) KrollFunction cb) {
		throw new RuntimeException("startListenerOnPort not yet implemented");
	}
}
