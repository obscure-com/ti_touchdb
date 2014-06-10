package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.lite.Revision;
import com.couchbase.lite.SavedRevision;
import com.couchbase.lite.ValidationContext;
import com.couchbase.lite.Validator;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class KrollValidator extends KrollProxy implements Validator {

    private static final String LCAT = "KrollValidator";

    private KrollFunction       validate;

    private DatabaseProxy       databaseProxy;

    public KrollValidator(DatabaseProxy databaseProxy, KrollFunction validate) {
        assert databaseProxy != null;
        assert validate != null;
        this.databaseProxy = databaseProxy;
        this.validate = validate;
    }

    @Override
    public void validate(Revision newRevision, ValidationContext context) {
        DocumentProxy documentProxy = databaseProxy.getDocument(newRevision.getDocument().getId());
        validate.call(this.getKrollObject(), new Object[] { new SavedRevisionProxy(documentProxy, (SavedRevision) newRevision),
                new ValidationContextProxy(documentProxy, context) });
    }

    protected KrollFunction getKrollFunction() {
        return validate;
    }
}
