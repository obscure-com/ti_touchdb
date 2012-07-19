package com.obscure.TiTouchDB;

import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.touchdb.TDDatabase;

@Kroll.proxy(parentModule=TitouchdbModule.class)
public class CouchDatabaseProxy extends KrollProxy {
	
	private TDDatabase db;
	
	public CouchDatabaseProxy(TDDatabase db) {
		this.db = db;
	}

	@Kroll.getProperty(name="relativePath")
	public String getRelativePath() {
		return db.getPath();
	}
	
	@Kroll.method
	public void create() {
		db.open();
	}
	
	@Kroll.method
	public boolean ensureCreated() {
		if (!db.exists()) {
			db.open();
		}
		return db.exists();
	}
	
	@Kroll.method
	public void deleteDatabase() {
		db.deleteDatabase();
	}
	
}
