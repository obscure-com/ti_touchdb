package com.obscure.titouchdb;

import java.util.List;

import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.lite.Reducer;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class KrollReducer extends KrollProxy implements Reducer {

    private static final String LCAT = "KrollViewReduceBlock";

    private KrollFunction       reduce;

    public KrollReducer(KrollFunction reduce) {
        assert reduce != null;
        this.reduce = reduce;
    }

    @Override
    public Object reduce(final List<Object> keys, final List<Object> values, boolean rereduce) {
        return reduce.call(this.getKrollObject(), new Object[] { TypePreprocessor.preprocess(keys), TypePreprocessor.preprocess(values), rereduce });
    }
}
