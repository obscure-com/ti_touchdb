package com.obscure.titouchdb;

import java.util.Map;

import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.lite.ReplicationFilter;
import com.couchbase.lite.SavedRevision;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class ReplicationFilterProxy extends KrollProxy implements ReplicationFilter {

    private KrollFunction validate;

    private DatabaseProxy database;

    public ReplicationFilterProxy(DatabaseProxy database, KrollFunction validate) {
        assert database != null;
        assert validate != null;
        this.database = database;
        this.validate = validate;
    }

    protected KrollFunction getKrollFunction() {
        return validate;
    }

    @Override
    public boolean filter(SavedRevision rev, Map<String, Object> props) {
        Object result = validate.call(this.getKrollObject(), new Object[] { new ReadOnlyRevisionProxy(rev), props });
        return result != null && ((Boolean) result).booleanValue();
    }
}
