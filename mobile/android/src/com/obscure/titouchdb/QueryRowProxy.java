package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import android.util.Log;

import com.couchbase.lite.QueryRow;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class QueryRowProxy extends KrollProxy {

    private static final String LCAT = "QueryRowProxy";

    private DatabaseProxy       databaseProxy;

    private QueryRow            row;

    public QueryRowProxy(DatabaseProxy databaseProxy, final QueryRow row) {
        assert databaseProxy != null;
        assert row != null;
        assert row.getKey() != null;

        this.databaseProxy = databaseProxy;
        this.row = row;
    }

    @Kroll.getProperty(name = "conflictingRevisions")
    public SavedRevisionProxy[] getConflictingRevisions() {
        // TODO
        return null;
    }

    @Kroll.getProperty(name = "database")
    public DatabaseProxy getDatabase() {
        return databaseProxy;
    }

    @Kroll.method
    public DocumentProxy getDocument() {
        if (row.getDocumentId() == null) {
            return null;
        }
        return new DocumentProxy(databaseProxy, row.getDocument());
    }

    @Kroll.getProperty(name = "documentID")
    public String getDocumentID() {
        return row.getDocumentId();
    }

    @Kroll.getProperty(name = "documentProperties")
    public KrollDict getDocumentProperties() {
        return TypePreprocessor.toKrollDict(row.getDocumentProperties());
    }

    @Kroll.getProperty(name = "documentRevisionID")
    public String getDocumentRevision() {
        return row.getDocumentRevisionId();
    }

    @Kroll.getProperty(name = "key")
    public Object getKey() {
        return TypePreprocessor.preprocess(row.getKey());
    }

    @Kroll.getProperty(name = "sequenceNumber")
    public long getSequenceNumber() {
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