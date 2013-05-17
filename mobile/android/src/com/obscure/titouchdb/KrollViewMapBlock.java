package com.obscure.titouchdb;

import java.util.Map;

import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.cblite.CBLViewMapBlock;
import com.couchbase.cblite.CBLViewMapEmitBlock;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class KrollViewMapBlock extends KrollProxy implements CBLViewMapBlock {

    private static final String LCAT = "KrollViewMapBlock";

    private CBLViewMapEmitBlock emitter;
    
    private KrollFunction       map;
    
    public KrollViewMapBlock(KrollFunction map) {
        assert map != null;
        this.map = map;
        TitouchdbModule.registerGlobalFunction(this, "emit", "(Ljava/lang/Object;Ljava/lang/Object;)V");
    }

    public void emit(Object key, Object value) {
        emitter.emit(key, value);
    }
    
    @Override
    public void map(Map<String, Object> document, CBLViewMapEmitBlock emitter) {
        this.emitter = emitter;
        map.call(this.getKrollObject(), new Object[] { document });
    }
}
