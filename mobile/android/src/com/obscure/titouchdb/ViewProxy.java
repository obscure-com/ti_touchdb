package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import android.util.Log;

import com.couchbase.lite.Mapper;
import com.couchbase.lite.Reducer;
import com.couchbase.lite.View;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class ViewProxy extends KrollProxy {

    private static final String LCAT = "ViewProxy";

    private DatabaseProxy       databaseProxy;

    private KrollFunction       map;

    private Object              reduce;

    private View                view;

    public ViewProxy(DatabaseProxy databaseProxy, View view) {
        assert databaseProxy != null;
        assert view != null;

        this.databaseProxy = databaseProxy;
        this.view = view;
    }

    @Kroll.method
    public QueryProxy createQuery() {
        return new QueryProxy(databaseProxy, view.createQuery());
    }

    @Kroll.method
    public void deleteIndex() {
        view.deleteIndex();
    }

    @Kroll.method
    public void deleteView() {
        view.delete();
    }

    @Kroll.getProperty(name = "database")
    public DatabaseProxy getDatabaseProxy() {
        return databaseProxy;
    }

    @Kroll.getProperty(name = "lastSequenceIndexed")
    public long getLastSequenceIndexed() {
        return view.getLastSequenceIndexed();
    }

    @Kroll.getProperty(name = "map")
    public KrollFunction getMap() {
        return map;
    }

    @Kroll.getProperty(name = "name")
    public String getName() {
        return view.getName();
    }

    @Kroll.getProperty(name = "reduce")
    public Object getReduce() {
        return reduce;
    }

    @Kroll.getProperty(name = "isStale")
    public boolean isStale() {
        return view.isStale();
    }

    @Kroll.method
    public boolean setMap(KrollFunction map, String version) {
        this.map = map;
        this.reduce = null;

        KrollMapper mapblock = new KrollMapper(map);
        return view.setMapReduce(mapblock, null, version);
    }

    @Kroll.method
    public boolean setMapReduce(KrollFunction map, Object reduce, String version) {
        this.map = map;
        this.reduce = reduce;

        Mapper mapblock = new KrollMapper(map);
        Reducer reduceblock = null;

        // built-in reduce functions
        if (reduce instanceof String) {
            String rname = (String) reduce;
            if ("_count".equals(rname)) {
                reduceblock = KrollReducer.COUNT;
            }
            else if ("_sum".equals(rname)) {
                reduceblock = KrollReducer.SUM;
            }
            else if ("_stats".equals(rname)) {
                reduceblock = KrollReducer.STATS;
            }
        }
        else if (reduce instanceof KrollFunction) {
            reduceblock = new KrollReducer((KrollFunction) reduce);
        }

        if (reduceblock == null) {
            Log.e(LCAT, "reduce function not recognized: " + reduce);
        }

        return view.setMapReduce(mapblock, reduceblock, version);
    }
}
