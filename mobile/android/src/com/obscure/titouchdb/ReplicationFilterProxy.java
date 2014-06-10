package com.obscure.titouchdb;

import java.util.Map;

import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.lite.ReplicationFilter;
import com.couchbase.lite.SavedRevision;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class ReplicationFilterProxy extends KrollProxy implements ReplicationFilter {

    private KrollFunction validate;

    private DatabaseProxy databaseProxy;

    public ReplicationFilterProxy(DatabaseProxy databaseProxy, KrollFunction validate) {
        assert databaseProxy != null;
        assert validate != null;
        this.databaseProxy = databaseProxy;
        this.validate = validate;
    }

    protected KrollFunction getKrollFunction() {
        return validate;
    }

    @Override
    public boolean filter(SavedRevision revision, Map<String, Object> props) {
        DocumentProxy documentProxy = databaseProxy.getDocument(revision.getDocument().getId());
        Object result = validate.call(this.getKrollObject(), new Object[] { new SavedRevisionProxy(documentProxy, revision), props });
        return result != null && ((Boolean) result).booleanValue();
    }
}
