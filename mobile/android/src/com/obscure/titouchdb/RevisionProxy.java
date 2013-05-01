package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.touchdb.TDRevision;

@Kroll.proxy(parentModule=TitouchdbModule.class)
public class RevisionProxy extends AbstractRevisionProxy {

    private TDRevision revision;

    public RevisionProxy(TDRevision rev) {
        this.revision = rev;
    }

    @Kroll.getProperty(name="propertiesAreLoaded")
    public boolean getPropertiesAreLoaded() {
        return false;
    }
    
    @Kroll.method
    public NewRevisionProxy newRevision() {
        return null;
    }
    
    @Kroll.method
    public RevisionProxy putProperties(KrollDict properties) {
        return null;
    }
    
    @Kroll.method
    public RevisionProxy deleteDocument() {
        return null;
    }
}
