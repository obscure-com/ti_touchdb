package com.obscure.titouchdb;

import java.util.Map;

import javax.xml.bind.TypeConstraintException;

import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.lite.Database;
import com.couchbase.lite.QueryRow;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class QueryRowProxy extends KrollProxy {

    private static final String LCAT = "QueryRowProxy";

    private QueryRow row;
    
    private Database         database;

    @SuppressWarnings({ "unchecked" })
    public QueryRowProxy(Database database, final QueryRow row) {
        assert database != null;
        assert row != null;
        assert row.getKey() != null;

        this.database = database;
        this.row = row;
    }

    @Kroll.getProperty(name = "document")
    public DocumentProxy getDocument() {
        if (row.getDocumentId() == null) {
            return null;
        }
        return new DocumentProxy(database, row.getDocumentId());
    }

    @Kroll.getProperty(name = "documentID")
    public String getDocumentID() {
        return row.getDocumentId();
    }

    @Kroll.getProperty(name = "documentProperties")
    public Map<String, Object> getDocumentProperties() {
        return row.getDocumentProperties();
    }

    @Kroll.getProperty(name = "documentRevision")
    public String getDocumentRevision() {
        return row.getDocumentRevisionId();
    }

    @Kroll.getProperty(name = "key")
    public Object getKey() {
        return row.getKey();
    }

    @Kroll.getProperty(name = "key0")
    public Object getKey0() {
        return keyAtIndex(0);
    }

    @Kroll.getProperty(name = "key1")
    public Object getKey1() {
        return keyAtIndex(1);
    }

    @Kroll.getProperty(name = "key2")
    public Object getKey2() {
        return keyAtIndex(2);
    }

    @Kroll.getProperty(name = "key3")
    public Object getKey3() {
        return keyAtIndex(3);
    }

    @Kroll.getProperty(name = "localSequence")
    public long getLocalSequence() {
        return row.getSequenceNumber();
    }

    @Kroll.getProperty(name = "sourceDocumentID")
    public String getSourceDocumentID() {
        return row.getSourceDocumentId();
    }

    @Kroll.getProperty(name = "value")
    public Object getValue() {
        return TypePreprocessor.preprocess(row.getValue());
    }

    @Kroll.method
    public Object keyAtIndex(int index) {
        Object key = row.getKey();
        if (key instanceof Object[] && index >= 0 && index < ((Object[]) key).length) {
            return ((Object[]) key)[index];
        }
        return null;
    }

}