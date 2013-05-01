package com.obscure.titouchdb;

import java.util.List;
import java.util.Map;

import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class QueryEnumeratorProxy extends KrollProxy {

    private List<Map<String, Object>> rows;

    public QueryEnumeratorProxy(List<Map<String, Object>> rows) {
        assert rows != null;
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
        return null;
    }

    @Kroll.method
    public QueryRowProxy rowAtIndex(int index) {
        return null;
    }
}
