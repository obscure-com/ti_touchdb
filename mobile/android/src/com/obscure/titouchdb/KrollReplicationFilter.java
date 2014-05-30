package com.obscure.titouchdb;

import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.lite.ReplicationFilter;
import com.couchbase.lite.SavedRevision;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class KrollReplicationFilter extends KrollProxy implements ReplicationFilter {

    private KrollFunction filter;

    public KrollReplicationFilter(KrollFunction filter) {
        assert filter != null;
        this.filter = filter;
    }

    @Override
    public boolean filter(SavedRevision revision, Map<String, Object> params) {
        KrollDict props = TypePreprocessor.toKrollDict(revision.getProperties());
        return (Boolean) filter.call(this.getKrollObject(), new Object[] { props, null });
    }

}
