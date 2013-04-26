package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiContext;

public class TDViewProxy extends KrollProxy {

    public TDViewProxy(TiContext tiContext) {
        super(tiContext);
        // TODO Auto-generated constructor stub
    }
    
    @Kroll.getProperty(name="name")
    public String getName() {
        return null;
    }

    @Kroll.method
    public boolean setMapAndReduce(KrollFunction map, KrollFunction reduce, String version) {
        return false;
    }
    
    @Kroll.method
    public boolean setMap(KrollFunction map, String version) {
        return false;
    }
    
    @Kroll.method
    public QueryProxy query() {
        return null;
    }
}
