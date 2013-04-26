package com.obscure.titouchdb.old;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.appcelerator.kroll.annotations.Kroll;

import android.util.Log;

import com.couchbase.touchdb.TDDatabase;
import com.couchbase.touchdb.TDStatus;
import com.couchbase.touchdb.TDView;
import com.couchbase.touchdb.TDViewMapBlock;
import com.couchbase.touchdb.TDViewReduceBlock;
import com.obscure.titouchdb.TitouchdbModule;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class SlowQueryCouchQueryProxy extends CouchQueryProxy {

	private static final String	LCAT	= "SlowQueryCouchQueryProxy";

	private String				language;

	private String				mapSource;

	private String				reduceSource;

	private TDView				view;

	public SlowQueryCouchQueryProxy(TDDatabase db, String mapSource, String reduceSource, String language) {
		super(db);
		this.mapSource = mapSource;
		this.reduceSource = reduceSource;
		this.language = language != null ? language : "javascript";
		initView(db);
	}

	@Override
	public CouchDesignDocumentProxy designDocument() {
		return null;
	}

	@Override
	protected void finalize() throws Throwable {
		// meh, db might not be open at this point
		// view.deleteView();
	}

	private void initView(TDDatabase db) {
		view = new TDView(db, "_temp_view");
		
		Log.i(LCAT, "compiling "+mapSource);

		String version = String.valueOf(System.currentTimeMillis());
		TDViewMapBlock map = TDView.getCompiler().compileMapFunction(mapSource, language);
		TDViewReduceBlock reduce = TDView.getCompiler().compileReduceFunction(reduceSource, language);

		view.setMapReduceBlocks(map, reduce, version);
	}

	@Override
	public CouchQueryEnumeratorProxy rows() {
		TDStatus status;

		// first, update the index
		status = view.updateIndex();
		if (status.getCode() != TDStatus.OK) {
			Log.w(LCAT, "problem updating view: " + status);
			return null;
		}

		// next, query with view options
		List<Map<String, Object>> rows = view.queryWithOptions(constructQueryOptions(), status);
		if (rows == null || status.getCode() != TDStatus.OK) {
			Log.w(LCAT, "problem querying view: " + status);
			return null;
		}

		// finally, construct the view response with rows and other properties
		Map<String, Object> viewResponse = new HashMap<String, Object>();
		viewResponse.put("rows", rows);
		viewResponse.put("total_rows", rows.size());
		viewResponse.put("offset", getSkip());
		if (isUpdateSeq()) {
			viewResponse.put("update_seq", view.getLastSequenceIndexed());
		}

		return new CouchQueryEnumeratorProxy(view.getDb(), viewResponse);
	}

}
