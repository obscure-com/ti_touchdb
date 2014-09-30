package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.lite.DocumentChange;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class DocumentChangeProxy extends KrollProxy {

    private String  documentId;

    private boolean isConflict;

    private boolean isCurrentRevision;

    private String  revisionId;

    private String  sourceUrl;

    public DocumentChangeProxy(DocumentChange change) {
        assert change != null;

        this.isCurrentRevision = change.isCurrentRevision();
        this.isConflict = change.isConflict();
        this.sourceUrl = change.getSourceUrl() != null ? change.getSourceUrl().toString() : "";
    }

    @Kroll.getProperty(name = "documentId")
    public String getDocumentId() {
        return documentId;
    }

    @Kroll.getProperty(name = "revisionId")
    public String getRevisionId() {
        return revisionId;
    }

    @Kroll.getProperty(name = "sourceUrl")
    public String getSourceUrl() {
        return sourceUrl;
    }

    @Kroll.getProperty(name = "isConflict")
    public boolean isConflict() {
        return isConflict;
    }

    @Kroll.getProperty(name = "isCurrentRevision")
    public boolean isCurrentRevision() {
        return isCurrentRevision;
    }

}
