package com.obscure.titouchdb.js;

import java.lang.reflect.Array;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.appcelerator.kroll.KrollDict;

public class TypeConverter {

	/**
	 * Return an object suitable to pass back to the JavaScript layer.
	 * 
	 * Proxies can expose methods, properties, and constants to JavaScript. Each
	 * of these can be a primitive type, or a proxy.
	 * 
	 * @param obj
	 * @return
	 */
	@SuppressWarnings("rawtypes")
	public static Object toJSObject(Object obj) {
		if (obj == null) return null;

		if (obj instanceof String || obj instanceof Number || obj instanceof Boolean || obj instanceof Character) return obj;

		if (obj.getClass().isArray()) {
			// convert to object array because obj might be another type
			int length = Array.getLength(obj);
			Object[] converted = new Object[length];
			for (int i = 0; i < length; i++) {
				converted[i] = toJSObject(Array.get(obj, i));
			}
			return converted;
		}

		if (obj instanceof List) {
			List list = (List) obj;
			int length = list.size();
			Object[] converted = new Object[list.size()];
			for (int i=0; i < length; i++) {
				converted[i] = toJSObject(list.get(i));
			}
			return converted;
		}
		
		if (obj instanceof Map) {
			Map map = (Map) obj;
			KrollDict dict = new KrollDict();
			for (Object key : map.keySet()) {
				dict.put(key.toString(), toJSObject(map.get(key)));
			}
			return dict;
		}
		
		return obj;
	}

}
