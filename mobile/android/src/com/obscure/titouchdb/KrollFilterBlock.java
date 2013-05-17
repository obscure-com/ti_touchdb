package com.obscure.titouchdb;

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
    public boolean filter(CBLRevision revision) {
        return (Boolean) filter.call(this.getKrollObject(), new Object[] { new BaseRevisionProxy(null, revision), null });
    }

}
