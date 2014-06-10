package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiBlob;

import com.couchbase.lite.CouchbaseLiteException;
import com.couchbase.lite.SavedRevision;
import com.couchbase.lite.UnsavedRevision;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class UnsavedRevisionProxy extends AbstractRevisionProxy {

    private static final String LCAT = "UnsavedRevisionProxy";

    public UnsavedRevisionProxy(DocumentProxy documentProxy, UnsavedRevision revision) {
        super(documentProxy, revision);
    }

    @Kroll.getProperty(name = "properties")
    public KrollDict getRevisionProperties() {
        /*
         * It appears that paired get/set annotations for a property need to be
         * in the same class file -- without this method,
         * getRevisionProperties() isn't called in JavaScript.
         */
        return super.getRevisionProperties();
    }
    
    @Kroll.getProperty(name = "userProperties")
    public KrollDict getUserProperties() {
        return super.getUserProperties();
    }
    
    @Kroll.getProperty(name = "isDeletion")
    public boolean isDeletion() {
        return super.isDeletion();
    }

    @Kroll.method
    public void removeAttachment(String name) {
        ((UnsavedRevision) revision).removeAttachment(name);
        // TODO attachment cache
    }

    @Kroll.method
    public SavedRevisionProxy save(@Kroll.argument(optional = true) boolean allowConflict) {
        lastError = null;
        try {
            SavedRevision saved = ((UnsavedRevision) revision).save(allowConflict);
            return new SavedRevisionProxy(documentProxy, saved);
        }
        catch (CouchbaseLiteException e) {
            lastError = TitouchdbModule.convertStatusToErrorDict(e.getCBLStatus());
        }
        return null;
    }

    @Kroll.method
    public void setAttachment(String name, String contentType, TiBlob content) {
        ((UnsavedRevision) revision).setAttachment(name, contentType, content.getInputStream());
    }

    @Kroll.setProperty(name = "isDeletion")
    public void setDeletion(boolean deletion) {
        ((UnsavedRevision) revision).setIsDeletion(deletion);
    }

    @Kroll.method
    public void setPropertyForKey(String key, Object value) {
        ((UnsavedRevision) revision).getProperties().put(key, value);
    }

    @Kroll.setProperty(name = "properties")
    public void setRevisionProperties(KrollDict properties) {
        ((UnsavedRevision) revision).setProperties(properties);
    }

    @Kroll.setProperty(name = "userProperties")
    public void setUserProperties(KrollDict properties) {
        ((UnsavedRevision) revision).setUserProperties(properties);
    }

}
