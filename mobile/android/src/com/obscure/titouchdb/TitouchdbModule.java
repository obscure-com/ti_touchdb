/**
 * $Id$
 * (c) 2012 Paul Mietz Egli
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 */
package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollModule;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiContext;

import android.util.Log;

@Kroll.module(name = "Titouchdb", id = "com.obscure.titouchdb")
public class TitouchdbModule extends KrollModule {
    
    @Kroll.constant
    public static final int REPLICATION_MODE_STOPPED = 0;
    
    @Kroll.constant
    public static final int REPLICATION_MODE_OFFLINE = 0;
    
    @Kroll.constant
    public static final int REPLICATION_MODE_IDLE = 0;
    
    @Kroll.constant
    public static final int REPLICATION_MODE_ACTIVE = 0;
    
    @Kroll.constant
    public static final int STALE_QUERY_NEVER = 0;
    
    @Kroll.constant
    public static final int STALE_QUERY_OK = 0;
    
    @Kroll.constant
    public static final int STALE_QUERY_UPDATE_AFTER = 0;

    public static final String     LCAT = "TiTouchDB";

    private DatabaseManagerProxy databaseManagerProxy;

    public TitouchdbModule(TiContext tiContext) {
        super(tiContext);
        this.databaseManagerProxy = new DatabaseManagerProxy(tiContext);
        Log.i(LCAT, this.toString() + " loaded");
    }

    @Kroll.getProperty(name = "databaseManager")
    public DatabaseManagerProxy getDatabaseManager() {
        return this.databaseManagerProxy;
    }
    
    
}
