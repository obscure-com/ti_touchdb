package com.obscure.titouchdb;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

import android.util.Log;

public class TypePreprocessor {

    private static final String LCAT = "TypePreprocessor";

    /**
     * Recursively convert List instances to Arrays so they can be passed to
     * JavaScript.
     * 
     * @param obj
     * @return
     */
    @SuppressWarnings({ "unchecked", "rawtypes" })
    public static Object preprocess(Object obj) {
        // short circuit
        if (!(obj instanceof Collection || obj instanceof Map)) {
            return obj;
        }

        if (obj instanceof List || obj instanceof Set) {
            Collection converted = null;
            try {
                converted = (Collection) obj.getClass().newInstance();
                for (Object el : (Collection) obj) {
                    converted.add(preprocess(el));
                }
            }
            catch (InstantiationException e) {
                Log.e(LCAT, "error creating new collection: " + e.getMessage());
            }
            catch (IllegalAccessException e) {
                Log.e(LCAT, "error creating new collection: " + e.getMessage());
            }
            return converted.toArray();
        }
        else if (obj instanceof Map) {
            Map converted = null;
            try {
                Map map = (Map) obj;
                converted = (Map) obj.getClass().newInstance();
                for (Object key : map.keySet()) {
                    converted.put(preprocess(key), preprocess(map.get(key)));
                }
            }
            catch (InstantiationException e) {
                Log.e(LCAT, "error creating new map: " + e.getMessage());
            }
            catch (IllegalAccessException e) {
                Log.e(LCAT, "error creating new map: " + e.getMessage());
            }
            return converted;
        }
        else {
            return obj;
        }
    }

}
