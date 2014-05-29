package com.obscure.titouchdb;

import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiBlob;

import com.couchbase.lite.CouchbaseLiteException;
import com.couchbase.lite.SavedRevision;
import com.couchbase.lite.UnsavedRevision;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class UnsavedRevisionProxy extends AbstractRevisionProxy {

    private static final String LCAT = "NewRevisionProxy";

    private DocumentProxy documentProxy;

    private UnsavedRevision revision;

    public UnsavedRevisionProxy(DocumentProxy documentProxy, UnsavedRevision revision) {
        super(documentProxy);
        assert documentProxy != null;
        assert revision != null;

        this.documentProxy = documentProxy;
        this.revision = revision;
    }

    
    @Override
    @SuppressWarnings("unchecked")
    @Kroll.getProperty(name = "properties")
    public KrollDict getRevisionProperties() {
        return new KrollDict((Map<? extends String, ? extends Object>) TypePreprocessor.preprocess(revision.getProperties()));
    }
    
    @Override
    @SuppressWarnings("unchecked")
    @Kroll.getProperty(name = "userProperties")
    public KrollDict getUserProperties() {
        return new KrollDict((Map<? extends String, ? extends Object>) TypePreprocessor.preprocess(revision.getUserProperties()));
    }
    
    @Kroll.getProperty(name = "isDeletion")
    public boolean isDeletion() {
        return revision.isDeletion();
    }

    @Kroll.method
    public void removeAttachment(String name) {
        revision.removeAttachment(name);
        // TODO attachment cache
    }
    
    @Kroll.method
    public SavedRevisionProxy save(@Kroll.argument(optional=true) boolean allowConflict) {
        lastError = null;
        try {
            SavedRevision saved = revision.save(allowConflict);
            return new SavedRevisionProxy(documentProxy, saved);
        }
        catch (CouchbaseLiteException e) {
            lastError = TitouchdbModule.convertStatusToErrorDict(e.getCBLStatus());
        }
        return null;
    }

    @Kroll.method
    public void setAttachment(String name, String contentType, TiBlob content) {
        revision.setAttachment(name, contentType, content.getInputStream());
    }

    @Kroll.setProperty(name = "isDeletion")
    public void setDeletion(boolean deletion) {
        revision.setIsDeletion(deletion);
    }

    @Kroll.setProperty(name = "properties")
    public void setRevisionProperties(KrollDict properties) {
        revision.setProperties(properties);
    }

    @Kroll.setProperty(name = "userProperties")
    public void setUserProperties(KrollDict properties) {
        revision.setUserProperties(properties);
    }
    
}
