package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.lite.Revision;
import com.couchbase.lite.ValidationContext;
import com.couchbase.lite.Validator;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class KrollValidator extends KrollProxy implements Validator {

    private KrollFunction validate;

    private DatabaseProxy database;

    public KrollValidator(DatabaseProxy database, KrollFunction validate) {
        assert database != null;
        assert validate != null;
        this.database = database;
        this.validate = validate;
    }

    @Override
    public void validate(Revision newRevision, ValidationContext context) {
        // TODO create validation context proxy; this is where we will need the
        // database

        // use a read-only revision proxy for validation
        validate.call(this.getKrollObject(), new Object[] { new ReadOnlyRevisionProxy(newRevision), null });
    }

}
