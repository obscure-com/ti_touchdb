package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.cblite.CBLRevision;

@Kroll.proxy(creatableInModule = TitouchdbModule.class)
public class ReadOnlyRevisionProxy extends AbstractRevisionProxy {

    private CBLRevision revision;

    public ReadOnlyRevisionProxy(CBLRevision rev) {
        super(null);
        assert rev != null;

        this.revision = rev;
    }

    @Override
    protected long getRevisionSequence() {
        return revision.getSequence();
    }

    @Override
    @Kroll.getProperty(name = "properties")
    public KrollDict getRevisionProperties() {
        return revision.getProperties() != null ? new KrollDict(revision.getProperties()) : null;
    }

    @Override
    @Kroll.getProperty(name = "revisionID")
    public String getRevisionID() {
        return revision.getRevId();
    }

}
