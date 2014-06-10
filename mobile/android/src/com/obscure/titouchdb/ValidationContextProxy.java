package com.obscure.titouchdb;

import java.util.List;

import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.lite.SavedRevision;
import com.couchbase.lite.ValidationContext;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class ValidationContextProxy extends KrollProxy {

    private static final String[] EMPTY_STRING_ARRAY = new String[0];

    private ValidationContext     context;

    private DocumentProxy         documentProxy;

    public ValidationContextProxy(DocumentProxy documentProxy, ValidationContext context) {
        assert documentProxy != null;
        assert context != null;
        this.documentProxy = documentProxy;
        this.context = context;
    }

    @Kroll.method
    public String[] getChangedKeys() {
        List<String> keys = context.getChangedKeys();
        return keys != null ? keys.toArray(EMPTY_STRING_ARRAY) : EMPTY_STRING_ARRAY;
    }

    @Kroll.method
    public AbstractRevisionProxy getCurrentRevision() {
        SavedRevision revision = context.getCurrentRevision();
        return revision != null ? new SavedRevisionProxy(documentProxy, revision) : null;
    }

    @Kroll.method
    public void reject(@Kroll.argument(optional=true) String message) {
        if (message != null) {
            context.reject(message);
        }
        else {
            context.reject();
        }
    }

    // TODO proxy validateChanges(ChangeValidator val) ? dunno what this gets
    // us...

}
