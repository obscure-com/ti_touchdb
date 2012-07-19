package com.obscure.TiTouchDB;

import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiContext;

@Kroll.proxy(parentModule=TitouchdbModule.class)
public class CouchReplicationProxy extends KrollProxy {

	public CouchReplicationProxy(TiContext tiContext) {
		super(tiContext);
	}

	
}
