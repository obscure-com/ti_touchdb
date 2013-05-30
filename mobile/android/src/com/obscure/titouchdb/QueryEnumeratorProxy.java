package com.obscure.titouchdb;

import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.cblite.CBLDatabase;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class QueryEnumeratorProxy extends KrollProxy {

    private List<Map<String, Object>> rows;

    private Iterator<Map<String,Object>> rowIterator;
    
    private CBLDatabase database;
    
    public QueryEnumeratorProxy(CBLDatabase database, List<Map<String, Object>> rows) {
        assert database != null;
        assert rows != null;
        
        this.database = database;
        this.rows = rows;
    }

    @Kroll.getProperty(name = "count")
    public int getCount() {
        return rows.size();
    }

    @Kroll.getProperty(name = "sequenceNumber")
    public int getSequenceNumber() {
        return 0;
    }

    @Kroll.method
    public QueryRowProxy nextRow() {
        if (rowIterator == null) {
            rowIterator = rows.iterator();
        }
        return rowIterator.hasNext() ? new QueryRowProxy(database, rowIterator.next()) : null;
    }

    @Kroll.method
    public QueryRowProxy rowAtIndex(int index) {
        if (index < 0 || index > rows.size()) {
            return null;
        }
        return new QueryRowProxy(database, rows.get(index));
    }
}
