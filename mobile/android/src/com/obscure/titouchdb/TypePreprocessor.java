package com.obscure.titouchdb;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class TypePreprocessor {

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
        if (!(obj instanceof Collection)) {
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
            }
            catch (IllegalAccessException e) {
            }
            return converted.toArray();
        }
        else if (obj instanceof Map) {
            // TODO convert keys and values
            return obj;
        }
        else {
            return obj;
        }
    }

}
