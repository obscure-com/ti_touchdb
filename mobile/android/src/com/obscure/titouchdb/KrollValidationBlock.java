package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.cblite.CBLRevision;
import com.couchbase.cblite.CBLValidationBlock;
import com.couchbase.cblite.CBLValidationContext;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class KrollValidationBlock extends KrollProxy implements CBLValidationBlock {

    private KrollFunction validate;

    private DatabaseProxy database;

    public KrollValidationBlock(DatabaseProxy database, KrollFunction validate) {
        assert database != null;
        assert validate != null;
        this.database = database;
        this.validate = validate;
    }

    @Override
    public boolean validate(CBLRevision newRevision, CBLValidationContext context) {
        // TODO create validation context proxy; this is where we will need the
        // database

        // use a read-only revision proxy for validation
        return (Boolean) validate.call(this.getKrollObject(), new Object[] { new ReadOnlyRevisionProxy(newRevision), null });
    }

}
