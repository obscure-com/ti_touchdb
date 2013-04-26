package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiContext;

public class RevisionProxy extends AbstractRevisionProxy {

    public RevisionProxy(TiContext tiContext) {
        super(tiContext);
        // TODO Auto-generated constructor stub
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
