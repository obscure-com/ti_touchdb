package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.lite.View;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class ViewProxy extends KrollProxy {

    private View view;

    private DatabaseProxy databaseProxy;
    
    public ViewProxy(DatabaseProxy databaseProxy, View view) {
        assert databaseProxy != null;
        assert view != null;
        
        this.databaseProxy = databaseProxy;
        this.view = view;
    }
    
    @Kroll.getProperty(name = "name")
    public String getName() {
        return view.getName();
    }

    @Kroll.method
    public boolean setMapAndReduce(KrollFunction map, KrollFunction reduce, String version) {
        KrollMapper mapblock = new KrollMapper(map);
        KrollReducer reduceblock = new KrollReducer(reduce);
        return view.setMapReduce(mapblock, reduceblock, version);
    }

    @Kroll.method
    public boolean setMap(KrollFunction map, String version) {
        KrollMapper mapblock = new KrollMapper(map);
        return view.setMapReduce(mapblock, null, version);
    }

    @Kroll.method
    public QueryProxy query() {
        return new QueryProxy(databaseProxy, view.createQuery());
    }
}
