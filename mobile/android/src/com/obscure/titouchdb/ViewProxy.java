package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.cblite.CBLView;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class ViewProxy extends KrollProxy {

    private CBLView view;

    public ViewProxy(CBLView view) {
        assert view != null;
        this.view = view;
    }

    @Kroll.getProperty(name = "name")
    public String getName() {
        return view.getName();
    }

    @Kroll.method
    public boolean setMapAndReduce(KrollFunction map, KrollFunction reduce, String version) {
        KrollViewMapBlock mapblock = new KrollViewMapBlock(map);
        KrollViewReduceBlock reduceblock = new KrollViewReduceBlock(reduce);
        return view.setMapReduceBlocks(mapblock, reduceblock, version);
    }

    @Kroll.method
    public boolean setMap(KrollFunction map, String version) {
        KrollViewMapBlock mapblock = new KrollViewMapBlock(map);
        return view.setMapReduceBlocks(mapblock, null, version);
    }

    @Kroll.method
    public QueryProxy query() {
        return new QueryProxy(view.getDb(), view.getName());
    }
}
