/**
 * $Id$
 * 
 * Copyright (c) 2012 Paul Mietz Egli
 * Licensed under the Apache Public License version 2.
 *
 * Appcelerator Titanium is Copyright (c) 2009-2010 by Appcelerator, Inc.
 * and licensed under the Apache Public License (version 2)
 */

#import "ComObscureTitouchdbModule.h"
#import "TiBase.h"
#import "TiHost.h"
#import "TiUtils.h"
#import "TDDatabaseManagerProxy.h"

extern BOOL EnableLog(BOOL enable);

@interface ComObscureTitouchdbModule ()
@property (nonatomic, strong) TDDatabaseManagerProxy * databaseManagerProxy;
@end

@implementation ComObscureTitouchdbModule

#pragma mark Internal

-(id)moduleGUID {
	return @"d9e122ec-cc6c-4987-85df-0a90523e738c";
}

-(NSString*)moduleId {
	return @"com.obscure.titouchdb";
}

#pragma mark Lifecycle

-(void)startup {
	[super startup];
    
    EnableLog(YES);

    self.databaseManagerProxy = [[TDDatabaseManagerProxy alloc] initWithExecutionContext:[self executionContext]];
    
	NSLog(@"[INFO] %@ loaded", self);
    
    if (__has_feature(objc_arc)) {
        NSLog(@"[INFO] ARC is enabled");
    }
}

-(void)shutdown:(id)sender {
	[super shutdown:sender];
}

#pragma mark Cleanup 

-(void)dealloc {
	[super dealloc];
}

#pragma mark Internal Memory Management

-(void)didReceiveMemoryWarning:(NSNotification*)notification
{
	// optionally release any resources that can be dynamically
	// reloaded once memory is available - such as caches
	[super didReceiveMemoryWarning:notification];
}

#pragma mark Listener Notifications

#pragma mark CBLDatabaseManager

- (id)databaseManager {
    return self.databaseManagerProxy;
}

#pragma mark -
#pragma mark Constants

MAKE_SYSTEM_PROP(REPLICATION_MODE_STOPPED, kCBLReplicationStopped)
MAKE_SYSTEM_PROP(REPLICATION_MODE_OFFLINE, kCBLReplicationOffline)
MAKE_SYSTEM_PROP(REPLICATION_MODE_IDLE, kCBLReplicationIdle)
MAKE_SYSTEM_PROP(REPLICATION_MODE_ACTIVE, kCBLReplicationActive)

MAKE_SYSTEM_PROP(STALE_QUERY_NEVER, kCBLStaleNever)
MAKE_SYSTEM_PROP(STALE_QUERY_OK, kCBLStaleOK)
MAKE_SYSTEM_PROP(STALE_QUERY_UPDATE_AFTER, kCBLStaleUpdateAfter)

@end
