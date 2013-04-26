package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollObject;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiContext;

public class QueryProxy extends KrollProxy {
    
    public static class TDQueryRowProxy {
        @Kroll.getProperty(name="key")
        public KrollObject getKey() {
            return null;
        }

        @Kroll.getProperty(name="value")
        public KrollObject getValue() {
            return null;
        }

        @Kroll.getProperty(name="documentID")
        public String getDocumentID() {
            return null;
        }

        @Kroll.getProperty(name="sourceDocumentID")
        public String getSourceDocumentID() {
            return null;
        }

        @Kroll.getProperty(name="documentRevision")
        public String getDocumentRevision() {
            return null;
        }
        
        @Kroll.getProperty(name="document")
        public DocumentProxy getDocument() {
            return null;
        }
        
        @Kroll.getProperty(name="documentProperties")
        public KrollDict getDocumentProperties() {
            return null;
        }
        
        @Kroll.method
        public KrollObject keyAtIndex(int index) {
            return null;
        }
        
        @Kroll.getProperty(name="key0")
        public KrollObject getKey0() {
            return null;
        }
        
        @Kroll.getProperty(name="key1")
        public KrollObject getKey1() {
            return null;
        }
        
        @Kroll.getProperty(name="key2")
        public KrollObject getKey2() {
            return null;
        }
        
        @Kroll.getProperty(name="key3")
        public KrollObject getKey3() {
            return null;
        }
        
        @Kroll.getProperty(name="localSequence")
        public int getLocalSequence() {
            return 0;
        }
        
        
    }
    
    public static class TDQueryEnumeratorProxy {
        
        @Kroll.getProperty(name="count")
        public int getCount() {
            return 0;
        }
        
        @Kroll.getProperty(name="sequenceNumber")
        public int getSequenceNumber() {
            return 0;
        }
        
        @Kroll.method
        public TDQueryRowProxy nextRow() {
            return null;
        }
        
        @Kroll.method
        public TDQueryRowProxy rowAtIndex(int index) {
            return null;
        }
    }
    
    private KrollDict lastError;
    
    public QueryProxy(TiContext tiContext) {
        super(tiContext);
        // TODO generate native object
    }

    @Kroll.getProperty(name="limit")
    public int getLimit() {
        return 0;
    }
    
    @Kroll.setProperty(name="limit")
    public void setLimit(int limit) {
        
    }
    
    @Kroll.getProperty(name="skip")
    public int getSkip() {
        return 0;
    }
    
    @Kroll.setProperty(name="skip")
    public void setSkip(int skip) {
        
    }
    
    @Kroll.getProperty(name="descending")
    public boolean getDescending() {
        return false;
    }
    
    @Kroll.setProperty(name="descending")
    public void setDescending(int descending) {
        
    }
    
    @Kroll.getProperty(name="startKey")
    public KrollObject getStartKey() {
        return null;
    }
    
    @Kroll.setProperty(name="startKey")
    public void setStartKey(KrollObject startKey) {
        
    }
    
    @Kroll.getProperty(name="endKey")
    public KrollObject getEndKey() {
        return null;
    }
    
    @Kroll.setProperty(name="endKey")
    public void setEndKey(KrollObject endKey) {
        
    }
    
    @Kroll.getProperty(name="startKeyDocID")
    public String getStartKeyDocID() {
        return null;
    }
    
    @Kroll.setProperty(name="startKeyDocID")
    public void setStartKeyDocID(String startKeyDocID) {
        
    }
    
    @Kroll.getProperty(name="endKeyDocID")
    public String getEndKeyDocID() {
        return null;
    }
    
    @Kroll.setProperty(name="endKeyDocID")
    public void setEndKeyDocID(String endKeyDocID) {
        
    }
    
    @Kroll.getProperty(name="keys")
    public KrollObject[] getKeys() {
        return null;
    }
    
    @Kroll.setProperty(name="keys")
    public void setKeys(KrollObject[] keys) {
        
    }
    
    @Kroll.getProperty(name="groupLevel")
    public int getGroupLevel() {
        return 0;
    }
    
    @Kroll.setProperty(name="groupLevel")
    public void setGroupLevel(int groupLevel) {
        
    }
    
    @Kroll.getProperty(name="prefetch")
    public boolean getPrefetch() {
        return false;
    }
    
    @Kroll.setProperty(name="prefetch")
    public void setPrefetch(int descending) {
        
    }

    @Kroll.getProperty(name="sequences")
    public boolean getSequences() {
        return false;
    }
    
    @Kroll.setProperty(name="sequences")
    public void setSequences(int sequences) {
        
    }

    @Kroll.getProperty(name="error")
    public KrollDict getError() {
        return lastError;
    }
    
    @Kroll.method
    public TDQueryEnumeratorProxy rows() {
        return null;
    }
    
    @Kroll.method
    public TDQueryEnumeratorProxy rowsIfChanged() {
        return null;
    }
}
