package com.obscure.titouchdb;

import java.util.Map;

import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import java.util.List;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class QueryRowProxy extends KrollProxy {

    private static final String LCAT = "QueryRowProxy";

    private String              docid;

    private Map<String, Object> docProperties;

    private Object              key;

    private String              rev;

    private int                 seq;

    private Object              value;

    @SuppressWarnings({ "unchecked", "rawtypes" })
    public QueryRowProxy(final Map<String, Object> row) {
        assert row != null;
        assert row.containsKey("key");

        this.docid = (String) row.get("id");
        this.rev = (String) row.get("rev");
        this.key = TypePreprocessor.preprocess(row.get("key"));
        this.value = TypePreprocessor.preprocess(row.get("value"));
        this.seq = row.containsKey("seq") ? (Integer) row.get("seq") : 0;
        this.docProperties = (Map<String, Object>) row.get("doc");
    }

    @Kroll.getProperty(name = "document")
    public DocumentProxy getDocument() {
        // TODO
        return null;
    }

    @Kroll.getProperty(name = "documentID")
    public String getDocumentID() {
        return docid;
    }

    @Kroll.getProperty(name = "documentProperties")
    public Map<String, Object> getDocumentProperties() {
        return docProperties;
    }

    @Kroll.getProperty(name = "documentRevision")
    public String getDocumentRevision() {
        return rev;
    }

    @Kroll.getProperty(name = "key")
    public Object getKey() {
        return key;
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
    public int getLocalSequence() {
        return seq;
    }

    @Kroll.getProperty(name = "sourceDocumentID")
    public String getSourceDocumentID() {
        return docid;
    }

    @Kroll.getProperty(name = "value")
    public Object getValue() {
        return value;
    }

    @Kroll.method
    public Object keyAtIndex(int index) {
        if (key instanceof Object[] && index >= 0 && index < ((Object[]) key).length) {
            return ((Object[]) key)[index];
        }
        return null;
    }

}