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
#import "Couch/CouchPersistentReplication.h"
#import "Couch/CouchQuery.h"
#import "Couch/CouchReplication.h"
#import "Couch/CouchTouchDBServer.h"


static TDMapEmitBlock emit_block;

static TiValueRef ThrowException (TiContextRef ctx, NSString *message, TiValueRef *exception) {
	TiStringRef jsString = TiStringCreateWithCFString((CFStringRef)message);
	*exception = TiValueMakeString(ctx,jsString);
	TiStringRelease(jsString);
	return TiValueMakeUndefined(ctx);
}

static TiValueRef EmitCallback(TiContextRef jsContext, TiObjectRef jsFunction, TiObjectRef jsThis, size_t argCount, const TiValueRef args[], TiValueRef* exception) {

	if (argCount!=2) {
		return ThrowException(jsContext, @"invalid number of arguments", exception);
	}

	KrollContext *ctx = GetKrollContext(jsContext);
    NSObject * key = [KrollObject toID:ctx value:args[0]];
    NSObject * value = [KrollObject toID:ctx value:args[1]];

    emit_block(key, value);

    return nil;
}


@interface ComObscureTiTouchDBModule (PrivateMethods)
- (void)bindCallback:(TiObjectCallAsFunctionCallback)fn name:(NSString*)name context:(KrollContext *)context;
@end


@implementation ComObscureTiTouchDBModule

KrollContext * krollContext;
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
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"TDDatabase"];
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"LogSync"];
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"LogSyncVerbose"];
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"LogRemoteRequest"];
    }
    
    // listen for TouchDB notifications
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(processNotification:) name:nil object:nil];
    
    // set up the isolated context for map/reduce
    krollContext = [[KrollContext alloc] init];
    krollContext.delegate = self;
    [krollContext start];
    
	server = [CouchTouchDBServer sharedInstance];
    NSAssert(!server.error, @"Error initializing TouchDB: %@", server.error);
    
    // TODO check error
    [TDView setCompiler:self];
    
	NSLog(@"[INFO] %@ loaded",self);
}

-(void)shutdown:(id)sender {
	[super shutdown:sender];
}

#pragma mark Cleanup 

-(void)dealloc {
    [krollContext stop];
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
#pragma mark KrollDelegate

- (BOOL)usesProxy:(id)proxy {
    return NO;
}

- (id)require:(KrollContext*)kroll path:(NSString*)path {
    // TODO support modules?
    return nil;
}

- (BOOL)shouldDebugContext {
    return YES;
}

-(void)didStartNewContext:(KrollContext*)kroll {
    [self bindCallback:EmitCallback name:@"emit" context:kroll];    
}

#pragma mark Context Functions

- (void)bindCallback:(TiObjectCallAsFunctionCallback)fn name:(NSString*)name context:(KrollContext *)krollContext; {    
	// create the invoker bridge
    TiContextRef context = [krollContext context];
	TiStringRef invokerFnName = TiStringCreateWithCFString((CFStringRef) name);
	TiValueRef invoker = TiObjectMakeFunctionWithCallback(context, invokerFnName, fn);
	if (invoker) {
		TiObjectRef global = TiContextGetGlobalObject(context); 
		TiObjectSetProperty(context, global,   
							invokerFnName, invoker,   
							kTiPropertyAttributeReadOnly | kTiPropertyAttributeDontDelete,   
							NULL); 
	}
	TiStringRelease(invokerFnName);
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


/*
#pragma mark -
#pragma mark JS Context Helpers

- (void)bindCallback:(NSString*)name callback:(TiObjectCallAsFunctionCallback)fn {
    TiContextRef context = [[self pageContext] krollContext].context;

	// create the invoker bridge
	TiStringRef invokerFnName = TiStringCreateWithCFString((CFStringRef) name);
	TiValueRef invoker = TiObjectMakeFunctionWithCallback(context, invokerFnName, fn);
	if (invoker) {
		TiObjectRef global = TiContextGetGlobalObject(context); 
		TiObjectSetProperty(context, global,   
							invokerFnName, invoker,   
							kTiPropertyAttributeReadOnly | kTiPropertyAttributeDontDelete,   
							NULL); 
	}
	TiStringRelease(invokerFnName);	
}

- (KrollCallback *)compileJavascriptFunction185:(NSString *)source {
    static NSString * MAP_EVAL_FORMAT = @"(function() { return %@; })()";

    KrollBridge * bridge = (KrollBridge *)self.pageContext;
    KrollContext * context = [bridge krollContext];

    KrollEval * eval = [[KrollEval alloc] initWithCode:[NSString stringWithFormat:MAP_EVAL_FORMAT, source]];
    TiValueRef exception = NULL;
    TiValueRef resultRef = [eval jsInvokeInContext:context exception:&exception];
    [eval release];

    if (exception != NULL) {
		id excm = [KrollObject toID:context value:exception];
		NSLog(@"[ERROR] Function script error = %@", [TiUtils exceptionMessage:excm]);
		fflush(stderr);
        return nil;
    }

    return [[[KrollCallback alloc] initWithCallback:resultRef thisObject:nil context:context] autorelease];
}


- (KrollCallback *)compileJavascriptFunction:(NSString *)source {
    static NSString * MAP_EVAL_FORMAT = @"(function() { return %@; })()";

    NSString * wrapped = [NSString stringWithFormat:MAP_EVAL_FORMAT, source];
    
    KrollEval *eval = [[KrollEval alloc] initWithCode:wrapped];
    NSLog(@"eval is %@", eval);
	id result = [eval invokeWithResult:self.pageContext];
    NSLog(@"result is %@", result);
    [eval release];
    return result;
}
*/

#pragma mark TDViewCompiler

#define SOURCE_WRAPPER @"(function() { return %@; })()"

- (TDMapBlock)compileMapFunction:(NSString*)mapSource language:(NSString*)language {
    if (![@"javascript" isEqualToString:language])
        return nil;

    KrollCallback * cb = [krollContext evalJSAndWait:[NSString stringWithFormat:SOURCE_WRAPPER, mapSource]];

    TDMapBlock result = ^(NSDictionary* doc, TDMapEmitBlock emit) {
        emit_block = emit;
        [cb call:[NSArray arrayWithObject:doc] thisObject:nil];
    };

    NSLog(@"compiled map: %@", mapSource);
    
    return [[result copy] autorelease];
}

- (TDReduceBlock)compileReduceFunction:(NSString*)reduceSource language:(NSString*)language {
    if (![@"javascript" isEqualToString:language])
        return nil;

    KrollCallback * cb = [krollContext evalJSAndWait:[NSString stringWithFormat:SOURCE_WRAPPER, reduceSource]];
    TDReduceBlock result = ^(NSArray* keys, NSArray* values, BOOL rereduce) {
        return [cb call:[NSArray arrayWithObjects:keys, values, nil] thisObject:nil];
    };

    return [[result copy] autorelease];
}

@end
