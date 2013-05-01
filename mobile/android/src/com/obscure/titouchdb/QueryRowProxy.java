package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollObject;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class QueryRowProxy extends KrollProxy {

    @Kroll.getProperty(name = "key")
    public KrollObject getKey() {
        return null;
    }

    @Kroll.getProperty(name = "value")
    public KrollObject getValue() {
        return null;
    }

    @Kroll.getProperty(name = "documentID")
    public String getDocumentID() {
        return null;
    }

    @Kroll.getProperty(name = "sourceDocumentID")
    public String getSourceDocumentID() {
        return null;
    }

    @Kroll.getProperty(name = "documentRevision")
    public String getDocumentRevision() {
        return null;
    }

    @Kroll.getProperty(name = "document")
    public DocumentProxy getDocument() {
        return null;
    }

    @Kroll.getProperty(name = "documentProperties")
    public KrollDict getDocumentProperties() {
        return null;
    }

    @Kroll.method
    public KrollObject keyAtIndex(int index) {
        return null;
    }

    @Kroll.getProperty(name = "key0")
    public KrollObject getKey0() {
        return null;
    }

    @Kroll.getProperty(name = "key1")
    public KrollObject getKey1() {
        return null;
    }

    @Kroll.getProperty(name = "key2")
    public KrollObject getKey2() {
        return null;
    }

    @Kroll.getProperty(name = "key3")
    public KrollObject getKey3() {
        return null;
    }

    @Kroll.getProperty(name = "localSequence")
    public int getLocalSequence() {
        return 0;
    }

}