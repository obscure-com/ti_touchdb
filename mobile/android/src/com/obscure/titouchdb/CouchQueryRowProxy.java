package com.obscure.titouchdb;

import java.util.Map;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollObject;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.touchdb.TDDatabase;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class CouchQueryRowProxy extends KrollProxy {

	private TDDatabase			db;

	private CouchDocumentProxy	document;

	private Object				key;

	private String				sourceDocumentID;

	private Object				value;

	private Map<String, Object>	documentProperties;

	@SuppressWarnings("unchecked")
	public CouchQueryRowProxy(TDDatabase db, Map<String, Object> row) {
		assert db != null;
		assert row != null;
		this.db = db;
		this.key = row.get("key");
		this.value = row.get("value");
		this.sourceDocumentID = (String) row.get("id");
		if (row.containsKey("doc")) {
			this.documentProperties = (Map<String, Object>) row.get("doc");
		}
	}

	/**
	 * The document this row was mapped from. This will be nil if a grouping was
	 * enabled in the query, because then the result rows don't correspond to
	 * individual documents.
	 */
	@Kroll.getProperty(name = "document")
	public CouchDocumentProxy document() {
		return sourceDocumentID != null ? new CouchDocumentProxy(db, db.getDocumentWithIDAndRev(sourceDocumentID, null, Constants.EMPTY_CONTENT_OPTIONS))
				: null;
	}

	/**
	 * The ID of the document described by this view row. (This is not
	 * necessarily the same as the document that caused this row to be emitted;
	 * see the discussion of the .sourceDocumentID property for details.)
	 */
	@Kroll.getProperty(name = "documentID")
	public String documentID() {
		return sourceDocumentID; // TODO
	}

	/**
	 * The properties of the document this row was mapped from. To get this, you
	 * must have set the -prefetch property on the query; else this will be nil.
	 */
	@Kroll.getProperty(name = "documentProperties")
	public KrollDict documentProperties() {
		return new KrollDict(documentProperties);
	}

	/**
	 * The revision ID of the document this row was mapped from.
	 */
	@Kroll.getProperty(name = "documentRevision")
	public String documentRevision() {
		return documentProperties != null ? (String) documentProperties.get("_rev") : null;
	}

	@Kroll.getProperty(name = "key")
	public Object key() {
		// TODO krollify'
		return key;
	}

	/**
	 * If this row's key is an array, returns the item at that index in the
	 * array. If the key is not an array, index=0 will return the key itself. If
	 * the index is out of range, returns nil.
	 */
	@Kroll.method
	public KrollObject keyAtIndex(int index) {
		Object obj = null;
		if (key == null) {
		}
		else if (key.getClass().isArray() && ((Object[]) key).length < index) {
			obj = ((Object[]) key)[index];
		}
		else if (index == 0) {
			obj = key;
		}
		// TODO krollify
		return (KrollObject) obj;
	}

	/**
	 * The ID of the document that caused this view row to be emitted. This is
	 * the value of the "id" property of the JSON view row. It will be the same
	 * as the .documentID property, unless the map function caused a related
	 * document to be linked by adding an "_id" key to the emitted value; in
	 * this case .documentID will refer to the linked document, while
	 * sourceDocumentID always refers to the original document.
	 */
	@Kroll.getProperty(name = "sourceDocumentID")
	public String sourceDocumentID() {
		return sourceDocumentID;
	}

	@Kroll.getProperty(name = "value")
	public Object value() {
		// TODO krollify
		return value;
	}
}
