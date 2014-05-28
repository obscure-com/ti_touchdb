package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.lite.QueryEnumerator;
import com.couchbase.lite.QueryRow;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class QueryEnumeratorProxy extends KrollProxy {

    private static final String LCAT = "QueryEnumeratorProxy";

    private DatabaseProxy       databaseProxy;

    private QueryEnumerator     enumerator;

    public QueryEnumeratorProxy(DatabaseProxy databaseProxy, QueryEnumerator enumerator) {
        assert databaseProxy != null;
        assert enumerator != null;

        this.databaseProxy = databaseProxy;
        this.enumerator = enumerator;
    }

    @Kroll.getProperty(name = "count")
    public int getCount() {
        return enumerator.getCount();
    }

    @Kroll.method
    public QueryRowProxy getRow(int index) {
        QueryRow row = enumerator.getRow(index);
        if (row != null) {
            return new QueryRowProxy(databaseProxy, row);
        }
        return null;
    }

    @Kroll.getProperty(name = "sequenceNumber")
    public long getSequenceNumber() {
        return enumerator.getSequenceNumber();
    }

    @Kroll.getProperty(name = "stale")
    public boolean isStale() {
        return enumerator.isStale();
    }

    @Kroll.method
    public QueryRowProxy next() {
        QueryRow row = enumerator.next();
        if (row != null) {
            return new QueryRowProxy(databaseProxy, row);
        }
        return null;
    }

    @Kroll.method
    public void reset() {
        enumerator.reset();
    }
}
