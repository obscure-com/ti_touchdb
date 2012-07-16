/**
 * $Id$
 * 
 * Copyright (c) 2012 Paul Mietz Egli
 * Licensed under the Apache Public License version 2.
 *
 * Appcelerator Titanium is Copyright (c) 2009-2010 by Appcelerator, Inc.
 * and licensed under the Apache Public License (version 2)
 */

#import "ComObscureTiTouchDBModule.h"
#import "TiBase.h"
#import "TiHost.h"
#import "TiUtils.h"
#import "CouchDatabaseProxy.h"
#import "CouchPersistentReplicationProxy.h"
#import "ViewCompiler.h"


@interface ComObscureTiTouchDBModule (PrivateMethods)
@end


@implementation ComObscureTiTouchDBModule

CouchTouchDBServer * server;

#pragma mark Internal

-(id)moduleGUID {
	return @"d9e122ec-cc6c-4987-85df-0a90523e738c";
}

-(NSString*)moduleId {
	return @"com.obscure.TiTouchDB";
}

#pragma mark Lifecycle

-(void)startup {
	[super startup];

    // set up logging
    if (YES) {
        gCouchLogLevel = 10;
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"Log"];
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"LogTDRouter"];
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"LogTDURLProtocol"];
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"LogSync"];
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"LogSyncVerbose"];
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"LogRemoteRequest"];
    }
    
    // listen for TouchDB notifications
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(processNotification:) name:nil object:nil];
    
	server = [CouchTouchDBServer sharedInstance];
    NSAssert(!server.error, @"Error initializing TouchDB: %@", server.error);
    
    // TODO check error
    ViewCompiler * viewCompiler = [[ViewCompiler alloc] init];
    [TDView setCompiler:viewCompiler];

	NSLog(@"[INFO] %@ loaded",self);
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

- (void)processNotification:(NSNotification *)notification {
    [self fireEvent:notification.name withObject:notification.userInfo];
}

-(void)_listenerAdded:(NSString *)type count:(int)count
{
	if (count == 1 && [type isEqualToString:@"my_event"])
	{
		// the first (of potentially many) listener is being added 
		// for event named 'my_event'
	}
}

-(void)_listenerRemoved:(NSString *)type count:(int)count
{
	if (count == 0 && [type isEqualToString:@"my_event"])
	{
		// the last listener called for event named 'my_event' has
		// been removed, we can optionally clean up any resources
		// since no body is listening at this point for that event
	}
}


#pragma mark -
#pragma mark CouchServer

- (id)getVersion:(id)args {
    return [server getVersion:nil];
}

- (id)generateUUIDs:(id)args {
    NSUInteger count;
    ENSURE_INT_AT_INDEX(count, args, 0)
    
    return [server generateUUIDs:count];
}

- (id)getDatabases:(id)args {
    NSArray * dbs = [server getDatabases];
    
    NSMutableArray * result = [NSMutableArray arrayWithCapacity:[dbs count]];
    for (CouchDatabase * db in dbs) {
        [result addObject:[CouchDatabaseProxy proxyWith:db]];
    }
    return result;
}

- (id)databaseNamed:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)
    
    CouchDatabase * db = [server databaseNamed:name];
    return [CouchDatabaseProxy proxyWith:db];
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

#pragma mark -
#pragma mark Constants

- (id)REPLICATION_STATE_IDLE {
    return [NSNumber numberWithInt:kReplicationIdle];
}

- (id)REPLICATION_STATE_TRIGGERED {
    return [NSNumber numberWithInt:kReplicationTriggered];
}

- (id)REPLICATION_STATE_COMPLETED {
    return [NSNumber numberWithInt:kReplicationCompleted];
}

- (id)REPLICATION_STATE_ERROR {
    return [NSNumber numberWithInt:kReplicationError];
}

- (id)REPLICATION_MODE_STOPPED {
    return [NSNumber numberWithInt:kCouchReplicationStopped];
}

- (id)REPLICATION_MODE_OFFLINE {
    return [NSNumber numberWithInt:kCouchReplicationOffline];
}

- (id)REPLICATION_MODE_IDLE {
    return [NSNumber numberWithInt:kCouchReplicationIdle];
}

- (id)REPLICATION_MODE_ACTIVE {
    return [NSNumber numberWithInt:kCouchReplicationActive];
}

- (id)STALE_QUERY_NEVER {
    return [NSNumber numberWithInt:kCouchStaleNever];
}

- (id)STALE_QUERY_OK {
    return [NSNumber numberWithInt:kCouchStaleOK];
}

- (id)STALE_QUERY_UPDATE_AFTER {
    return [NSNumber numberWithInt:kCouchStaleUpdateAfter];
}
@end
