package com.obscure.titouchdb;

import java.util.Map;

import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.lite.Emitter;
import com.couchbase.lite.Mapper;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class KrollMapper extends KrollProxy implements Mapper {

    private static final String LCAT = "KrollViewMapBlock";

    private static Emitter      emitter;

    private KrollFunction       map;

    public KrollMapper(KrollFunction map) {
        assert map != null;
        this.map = map;
        TitouchdbModule.registerGlobalFunction(this, "emit", "(Ljava/lang/Object;Ljava/lang/Object;)V");
    }

    public void emit(Object key, Object value) {
        emitter.emit(key, value);
    }

    @Override
    public void map(Map<String, Object> document, Emitter emitter) {
        KrollMapper.emitter = emitter;
        map.call(this.getKrollObject(), new Object[] { TypePreprocessor.preprocess(document) });
    }

}
