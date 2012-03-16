package com.obscure.TiTouchDB;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.kroll.common.Log;

import com.couchbase.touchdb.TDRevision;
import com.couchbase.touchdb.TDStatus;
import com.couchbase.touchdb.TDView;
import com.couchbase.touchdb.TDViewMapBlock;
import com.couchbase.touchdb.TDViewReduceBlock;

@Kroll.proxy
public class TDViewProxy extends KrollProxy {

	private static final String	LCAT	= "TDViewProxy";

	private TDView				view;

	public TDViewProxy(TDView view) {
		this.view = view;
	}

	public TDView getView() {
		return view;
	}

	public void setView(TDView view) {
		this.view = view;
	}

	@Kroll.method
	public void deleteView() {
		view.deleteView();
	}

	@Kroll.getProperty
	public String name() {
		return view.getName();
	}

	@Kroll.getProperty
	public boolean stale() {
		return view.isStale();
	}

	@Kroll.getProperty
	public long lastSequenceIndexed() {
		return view.getLastSequenceIndexed();
	}

	@Kroll.method
	public int updateIndex() {
		prepareView();
		TDStatus status = view.updateIndex();
		return status.getCode();
	}

	@SuppressWarnings("unchecked")
	private void prepareView() {
		if (view.getMapBlock() == null) {
			String[] viewName = view.getName().split("/");
			if (viewName == null || viewName.length != 2) {
				Log.e(LCAT, String.format("Invalid view name: %s", view.getName()));
				return;
			}

			String ddocname = String.format("_design/%s", viewName[0]);
			TDRevision ddoc = view.getDb().getDocumentWithIDAndRev(ddocname, null, null);
			if (ddoc == null) {
				Log.e(LCAT, String.format("Missing view named '%s'", view.getName()));
				return;
			}

			Map<String, Object> views = (Map<String, Object>) ddoc.getProperties().get("views");
			if (views == null || !views.containsKey(viewName[1])) {
				Log.e(LCAT, String.format("Design doc %s is missing view named %s", ddocname, viewName[1]));
				return;
			}
			Map<String,Object> viewdoc = (Map<String, Object>) views.get(viewName[1]);
			compileViewFromProperties(viewdoc);
		}
	}

	private void compileViewFromProperties(Map<String, Object> props) {
		if (props == null) return;
		
		String language = props.containsKey("language") ? (String) props.get("language") : "javascript";
		String mapSource = (String) props.get("map");
		if (mapSource == null) {
			Log.w(LCAT, "Missing map source; not compiling view");
			return;
		}
		
		TDViewMapBlock mapBlock = TDView.getCompiler().compileMapFunction(mapSource, language);
		if (mapBlock == null) {
			Log.e(LCAT, "Could not compile map function");
			return;
		}
		
		TDViewReduceBlock reduceBlock = null;
		String reduceSource = (String) props.get("reduce");
		if (reduceSource != null) {
			reduceBlock = TDView.getCompiler().compileReduceFunction(reduceSource, language);
		}
		
		view.setMapReduceBlocks(mapBlock, reduceBlock, "1");
	}

	@Kroll.method
	public KrollDict queryWithOptions(KrollDict options) {
		TDStatus status = new TDStatus();
		updateIndex();
		List<Map<String, Object>> rows = view.queryWithOptions(TDDatabaseProxy.toQueryOptions(options), status);
		// TODO check status?
		KrollDict result = new KrollDict();
		result.put("rows", TitouchdbModule.krollify(rows));
		return result;
	}
}
