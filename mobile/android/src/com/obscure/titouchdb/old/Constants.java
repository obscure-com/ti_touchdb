package com.obscure.titouchdb.old;

import java.util.EnumSet;

import com.couchbase.touchdb.TDDatabase.TDContentOptions;

public interface Constants {
	
	public static final EnumSet<TDContentOptions>	EMPTY_CONTENT_OPTIONS	= EnumSet.noneOf(TDContentOptions.class);

}
