package com.obscure.titouchdb;

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

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class ViewCouchQueryProxy extends CouchQueryProxy {

	private static final String			LCAT	= "ViewCouchQueryProxy";

	private CouchDesignDocumentProxy	ddoc;

	private TDView						view;

	public ViewCouchQueryProxy(TDDatabase db, String name, CouchDesignDocumentProxy ddoc) {
		super(db);
		assert ddoc != null;
		this.ddoc = ddoc;

		initView(db, name);
	}

	@Override
	public CouchDesignDocumentProxy designDocument() {
		return ddoc;
	}

	private void initView(TDDatabase db, String name) {
		view = new TDView(db, name);

		String version = ddoc.currentRevisionID();
		TDViewMapBlock map = TDView.getCompiler().compileMapFunction(ddoc.mapFunctionOfViewNamed(name), ddoc.language());
		TDViewReduceBlock reduce = TDView.getCompiler().compileReduceFunction(ddoc.reduceFunctionOfViewNamed(name), ddoc.language());

		view.setMapReduceBlocks(map, reduce, version);
	}

	@Override
	public CouchQueryEnumeratorProxy rows() {
		TDStatus status;
		
		// first, update the index
		status = view.updateIndex();
		if (status.getCode() != TDStatus.OK && status.getCode() != TDStatus.NOT_MODIFIED) {
			Log.w(LCAT, "problem updating view: " + status);
			return null;
		}

		// next, query with view options
		List<Map<String,Object>> rows = view.queryWithOptions(constructQueryOptions(), status);
		if (rows == null || status.getCode() != TDStatus.OK) {
			Log.w(LCAT, "problem querying view: "+status);
			return null;
		}
		
		// finally, construct the view response with rows and other properties
		Map<String,Object> viewResponse = new HashMap<String,Object>();
		viewResponse.put("rows", rows);
		viewResponse.put("total_rows", rows.size());
		viewResponse.put("offset", getSkip());
		if (isUpdateSeq()) {
			viewResponse.put("update_seq", view.getLastSequenceIndexed());
		}
		
		return new CouchQueryEnumeratorProxy(view.getDb(), viewResponse);
	}

}
