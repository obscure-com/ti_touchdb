package com.obscure.titouchdb;

import java.util.Iterator;
import java.util.List;

import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.lite.Database;
import com.couchbase.lite.QueryRow;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class QueryEnumeratorProxy extends KrollProxy {

    private static final String           LCAT = "QueryEnumeratorProxy";

    private List<QueryRow>     rows;

    private Iterator<QueryRow> rowIterator;

    private Database                   database;

    public QueryEnumeratorProxy(Database database, List<QueryRow> rows) {
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
