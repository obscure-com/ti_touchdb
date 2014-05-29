package com.obscure.titouchdb;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
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
        if (obj == null) {
            return null;
        }
        
        // short circuit
        if (!(obj instanceof Collection || obj instanceof Map)) {
            return obj;
        }

        if (obj instanceof List || obj instanceof Set) {
            Collection converted = new ArrayList();
            for (Object el : (Collection) obj) {
                converted.add(preprocess(el));
            }
            return converted.toArray();
        }
        else if (obj instanceof Map) {
            Map converted = new HashMap();
            Map map = (Map) obj;
            for (Object key : map.keySet()) {
                converted.put(preprocess(key), preprocess(map.get(key)));
            }
            return converted;
        }
        else {
            return obj;
        }
    }

}
