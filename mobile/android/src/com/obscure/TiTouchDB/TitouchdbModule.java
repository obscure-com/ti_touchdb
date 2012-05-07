/**
 * $Id$
 * (c) 2012 Paul Mietz Egli
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 */
package com.obscure.TiTouchDB;

import java.util.List;
import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollModule;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.kroll.common.Log;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

import com.couchbase.touchdb.TDServer;
import com.couchbase.touchdb.TDViewCompiler;
import com.couchbase.touchdb.TDViewMapBlock;
import com.couchbase.touchdb.TDViewMapEmitBlock;
import com.couchbase.touchdb.TDViewReduceBlock;

//import com.couchbase.touchdb.listener.TDListener;

@Kroll.module(name = "Titouchdb", id = "com.obscure.TiTouchDB")
public class TitouchdbModule extends KrollModule implements TDViewCompiler {
	
	/*
	private static final String[]		EMPTY_STRING_ARRAY			= new String[0];

	private static TDDatabaseProxy[]	EMPTY_TDDATABASEPROXY_ARRAY	= new TDDatabaseProxy[0];
	*/

	private static final String			LCAT						= "TiTouchDB";

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

	private TDViewMapEmitBlock	currentEmitBlock;

	private TDServer			server;

	public TitouchdbModule() {
		super();
	}

	private static TDViewMapEmitBlock	EMIT_BLOCK	= null;

	public static class EmitHolder extends ScriptableObject {

		private static final long	serialVersionUID	= 175821839328120859L;

		@Override
		public String getClassName() {
			return EmitHolder.class.getName();
		}

		public static void emit(Object key, Object value) {
			if (EMIT_BLOCK != null) {
				Object k = ScriptValueConverter.unwrapValue(key);
				Object v = ScriptValueConverter.unwrapValue(value);
				EMIT_BLOCK.emit(k, v);
			}
			else {
				Log.w(LCAT, "missing emit block");
			}
		}
	}

	public TDViewMapBlock compileMapFunction(final String source, String language) {
		if (!"javascript".equalsIgnoreCase(language)) {
			Log.w(LCAT, String.format("cannot compile non-javascript language '%s'", language));
			return null;
		}

		/*
		 * Ok, using Rhino to compile and run map functions is less efficient
		 * than V8, but it seems like I'll need to add a native call to get V8
		 * working as there are no hooks it in the Titanium common kroll
		 * context.
		 */

		return new TDViewMapBlock() {
			private Context				cx;
			private Function			fn;
			private ScriptableObject	scope;

			@Override
			protected void finalize() throws Throwable {
				Context.exit();
				super.finalize();
			}

			public void map(Map<String, Object> doc, TDViewMapEmitBlock emit) {
				EMIT_BLOCK = emit;

				if (cx == null) {
					cx = Context.enter();
					cx.setOptimizationLevel(-1);
					scope = cx.initStandardObjects();
					scope.defineFunctionProperties(new String[] { "emit" }, EmitHolder.class, ScriptableObject.DONTENUM);
					fn = cx.compileFunction(scope, source, "<map>", 1, null);
				}

				fn.call(cx, scope, scope, new Object[] { ScriptValueConverter.wrapValue(scope, doc) });
			}
		};
	}

	public TDViewReduceBlock compileReduceFunction(final String source, String language) {
		if (!"javascript".equalsIgnoreCase(language)) {
			Log.w(LCAT, String.format("cannot compile non-javascript language '%s'", language));
			return null;
		}

		return new TDViewReduceBlock() {
			private Context		cx;
			private Function	fn;
			private Scriptable	scope;

			@Override
			protected void finalize() throws Throwable {
				Context.exit();
				super.finalize();
			}

			public Object reduce(List<Object> keys, List<Object> values, boolean rereduce) {
				if (cx == null) {
					cx = Context.enter();
					cx.setOptimizationLevel(-1);
					scope = cx.initStandardObjects();
					fn = cx.compileFunction(scope, source, "<reduce>", 1, null);
				}

				return fn.call(cx, scope, scope, new Object[] { ScriptValueConverter.wrapValue(scope, keys), ScriptValueConverter.wrapValue(scope, values),
						ScriptValueConverter.wrapValue(scope, rereduce) });
			}

		};
	}

	@Kroll.getProperty(name="activeTasks")
	public KrollDict[] activeTasks() {
		return null;
	}
	
	@Kroll.getProperty(name="activityPollingInterval")
	public int activityPollingInterval() {
		return 0;
	}
	
	@Kroll.setProperty(name="activityPollingInterval")
	public void setActivityPollingInterval(int val) {
		
	}
	
	@Kroll.getProperty(name="replications")
	public CouchReplicationProxy[] replications() {
		return null;
	}
	
	/*
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
	*/
}

