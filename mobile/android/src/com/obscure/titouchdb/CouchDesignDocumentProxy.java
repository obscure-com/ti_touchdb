package com.obscure.titouchdb;

import java.util.HashMap;
import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.annotations.Kroll;

import android.util.Log;

import com.couchbase.touchdb.TDBody;
import com.couchbase.touchdb.TDDatabase;
import com.couchbase.touchdb.TDRevision;

@SuppressWarnings("unchecked")
@Kroll.proxy(parentModule = TitouchdbModule.class)
public class CouchDesignDocumentProxy extends CouchDocumentProxy {

	private static final String					LCAT					= "CouchDesignDocumentProxy";

	private static final String[]				EMPTY_STRING_ARRAY		= new String[0];

	private static final Map<String, Object>	EMPTY_MAP				= new HashMap<String, Object>(0);

	private boolean								changed					= false;

	private boolean								includeLocalSequence	= false;

	public CouchDesignDocumentProxy(TDDatabase db, TDRevision rev) {
		super(db, rev);
	}

	@Kroll.getProperty(name = "changed")
	public boolean changed() {
		return changed;
	}

	/**
	 * Sets the definition of a view, or deletes it. After making changes to one
	 * or more views, you should call saveChanges() to put them back to the
	 * database. If the new definition is identical to the existing one, the
	 * design document will not be marked as changed or saved back to the
	 * database.
	 * 
	 * @param viewName
	 *            The name of the view, in the scope of this design doc.
	 * @param mapFunction
	 *            The source code of the map function. If nil, the view will be
	 *            deleted.
	 * @param reduceFunction
	 *            The source code of the reduce function. Optional; pass nil for
	 *            none.
	 */
	@Kroll.method
	public void defineView(String name, String mapFunction, @Kroll.argument(optional=true) String reduceFunction) {
		if (name == null || name.length() < 1) {
			Log.w(LCAT, "invalid view name: " + name);
			return;
		}

		Map<String, Object> views = (Map<String, Object>) docGet("views");
		if (views == null) {
			views = new HashMap<String,Object>();
		}

		if (mapFunction == null) {
			views.remove(name);
		}
		else {
			Map<String, Object> fns = new HashMap<String, Object>();
			fns.put("map", mapFunction);
			if (reduceFunction != null) {
				fns.put("reduce", reduceFunction);
			}
			views.put(name, fns);
		}

		docPut("views", views);
	}

	private Object docGet(String name) {
		if (currentRevision == null) return null;
		Map<String, Object> props = currentRevision.getBody().getProperties();
		if (props == null) {
			props = new HashMap<String, Object>();
		}
		return props.get(name);
	}

	private void docPut(String name, Object value) {
		if (currentRevision == null) {
			currentRevision = new TDRevision(EMPTY_MAP);
		}
		Map<String, Object> props = currentRevision.getBody().getProperties();
		if (props == null) {
			props = new HashMap<String, Object>();
			currentRevision.setBody(new TDBody(props));
		}
		props.put(name, value);
		changed = true;
	}

	@Kroll.getProperty(name = "includeLocalSequence")
	public boolean includeLocalSequence() {
		return includeLocalSequence;
	}

	@Kroll.method
	public boolean isLanguageAvailable(String language) {
		return "javascript".equalsIgnoreCase(language);
	}

	@Kroll.getProperty(name = "language")
	public String language() {
		String language = (String) docGet("language");
		return language != null ? language : "javascript";
	}

	@Kroll.method
	public String mapFunctionOfViewNamed(String name) {
		Map<String, Object> views = (Map<String, Object>) docGet("views");

		if (views == null) {
			return null;
		}

		Map<String, Object> view = (Map<String, Object>) views.get(name);
		if (view == null) {
			return null;
		}

		return (String) view.get("map");
	}

	@Kroll.method
	public CouchQueryProxy queryViewNamed(String name) {
		saveChanges();
		return new ViewCouchQueryProxy(db, name, this);
	}

	private Map<String, Object> viewNamed(String name) {
		Map<String, Object> views = (Map<String, Object>) docGet("views");

		if (views == null) {
			return EMPTY_MAP;
		}

		Map<String, Object> view = (Map<String, Object>) views.get(name);
		return view != null ? view : EMPTY_MAP;
	}

	@Kroll.method
	public String reduceFunctionOfViewNamed(String name) {
		Map<String, Object> views = (Map<String, Object>) docGet("views");

		if (views == null) {
			return null;
		}

		Map<String, Object> view = (Map<String, Object>) views.get(name);
		if (view == null) {
			return null;
		}

		return (String) view.get("reduce");
	}

	@Kroll.method
	public void saveChanges() {
		Map<String, Object> props = currentRevision.getBody().getProperties();
		if (props == null) {
			props = new HashMap<String, Object>();
		}
		putProperties(new KrollDict(props));
		changed = false;
	}

	@Kroll.setProperty(name = "includeLocalSequence")
	public void setIncludeLocalSequence(boolean includeLocalSequence) {
		this.includeLocalSequence = includeLocalSequence;
	}

	@Kroll.setProperty(name = "language")
	public void setLanguage(String language) {
		docPut("language", language);
	}

	@Kroll.setProperty(name = "validation")
	public void setValidation(String validation) {
		docPut("validation", validation);
	}

	@Kroll.getProperty(name = "validation")
	public String validation() {
		return (String) docGet("validation");
	}

	@Kroll.getProperty(name = "viewNames")
	public String[] viewNames() {
		Map<String, Object> views = (Map<String, Object>) docGet("views");
		return views != null ? views.keySet().toArray(EMPTY_STRING_ARRAY) : EMPTY_STRING_ARRAY;
	}
}
