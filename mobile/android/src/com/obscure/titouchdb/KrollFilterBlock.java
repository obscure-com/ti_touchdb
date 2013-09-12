package com.obscure.titouchdb;

import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.cblite.CBLFilterBlock;
import com.couchbase.cblite.CBLRevision;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class KrollFilterBlock extends KrollProxy implements CBLFilterBlock {

    private KrollFunction filter;

    public KrollFilterBlock(KrollFunction filter) {
        assert filter != null;
        this.filter = filter;
    }

    @Override
    @SuppressWarnings("unchecked")
    public boolean filter(CBLRevision revision) {
        KrollDict props = new KrollDict((Map<String, Object>) TypePreprocessor.preprocess(revision.getProperties()));
        return (Boolean) filter.call(this.getKrollObject(), new Object[] { props, null });
    }

}
