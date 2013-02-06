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
#import "TiMacroFixups.h"
#import "TDDatabaseManagerProxy.h"

#pragma mark Global Functions

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

    // set up logging
    if (NO) {
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"Log"];
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"LogCBLRouter"];
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"LogCBLURLProtocol"];
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"LogSync"];
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"LogSyncVerbose"];
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"LogRemoteRequest"];
    }
    
    // listen for notifications
//    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(processNotification:) name:nil object:nil];
    
    /*
    // TODO check error
    ViewCompiler * viewCompiler = [[ViewCompiler alloc] init];
    [CBLView setCompiler:viewCompiler];
     */

	NSLog(@"[INFO] %@ loaded", self);
    
    if (__has_feature(objc_arc)) {
        NSLog(@"[INFO] ARC is enabled");
    }
}

-(void)shutdown:(id)sender {
//    [[NSNotificationCenter defaultCenter] removeObserver:self];
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
    return [TDDatabaseManagerProxy sharedInstance];
}

/*
- (void)processNotification:(NSNotification *)notification {
    ENSURE_UI_THREAD_1_ARG(notification);
    
    if ([notification.name isEqualToString:kCouchDatabaseProxyDeletedNotification]) {
        CouchDatabaseProxy * proxy = notification.object;
        [self.databaseCache removeObjectForKey:proxy.cacheID];
    }
    else {
        [self fireEvent:notification.name withObject:notification.userInfo];
    }
}

#pragma mark -
#pragma mark CBLDatabaseManager

- (id)getVersion:(id)args {
    return CBLVersionString();
}



- (id)generateUUIDs:(id)args {
    NSUInteger count;
    ENSURE_INT_AT_INDEX(count, args, 0)
    
    return [server generateUUIDs:count];
}

- (CouchDatabaseProxy *)databaseProxyNamed:(NSString *)name {
    CouchDatabaseProxy * result = [self.databaseCache objectForKey:name];
    if (!result) {
        CouchDatabase * db = [server databaseNamed:name];
        result = [CouchDatabaseProxy proxyWith:db];
        result.cacheID = name;
        [self.databaseCache setObject:result forKey:result.cacheID];
    }
    return result;
}

- (id)getDatabases:(id)args {
    NSArray * dbs = [server getDatabases];
    
    NSMutableArray * result = [NSMutableArray arrayWithCapacity:[dbs count]];
    for (CouchDatabase * db in dbs) {
        // TODO make sure db name and relative path are the same!
        CouchDatabaseProxy * proxy = [self databaseProxyNamed:db.relativePath];
        [result addObject:proxy];
    }
    return result;
}

- (id)databaseNamed:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)
    
    return [self databaseProxyNamed:name];
}

- (id)activeTasks {    
    return server.activeTasks;
}

- (id)activityPollingInterval {
    return [NSNumber numberWithLong:server.activityPollInterval];
}

- (void)setActivityPollingInterval:(id)value {
    server.activityPollInterval = [value longValue]; 
}

- (id)replications {
    NSMutableArray * result = [NSMutableArray array];
    for (CouchPersistentReplication * rep in server.replications) {
        [result addObject:[CouchPersistentReplicationProxy proxyWith:rep]];
    }
    return result;
}
 */

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
