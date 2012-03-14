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
#import <TouchDB/TouchDB.h>
#import <TouchDBListener/TDListener.h>
#import "TDDatabaseProxy.h"

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
- (void)bindCallback:(NSString*)name callback:(TiObjectCallAsFunctionCallback)fn;
@end


@implementation ComObscureTiTouchDBModule

TDServer * touchServer;
TDListener * touchListener;

#pragma mark Internal

-(id)moduleGUID {
	return @"d9e122ec-cc6c-4987-85df-0a90523e738c";
}

-(NSString*)moduleId {
	return @"com.obscure.TiTouchDB";
}

#pragma mark Lifecycle

- (void)startTouchDBServer {
    NSArray * paths = NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, NSUserDomainMask, YES);
    NSString * path = [paths objectAtIndex:0];
#if !TARGET_OS_IPHONE
    path = [path stringByAppendingPathComponent: [[NSBundle mainBundle] bundleIdentifier]];
#endif
    path = [path stringByAppendingPathComponent: @"TouchDB"];
    NSError* error = nil;
    if ([[NSFileManager defaultManager] createDirectoryAtPath:path
                                  withIntermediateDirectories:YES
                                                   attributes:nil
                                                        error:&error]) {
        touchServer = [[TDServer alloc] initWithDirectory:path error:&error];
    }
    NSAssert(!error, @"Error creating TouchDB server: %@", error);    
}

-(void)startup {
	[super startup];

    // listen for TouchDB notifications
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(processNotification:) name:nil object:nil];
    
    // bind the emit() function to the module JS context
    [self bindCallback:@"emit" callback:&EmitCallback];

	[self startTouchDBServer];
    [TDView setCompiler:self];
    
    if (YES) {
        NSLog(@"logging sync stuff");
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"Log"];
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"LogSync"];
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"LogSyncVerbose"];
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"LogRemoteRequest"];
    }

	NSLog(@"[INFO] %@ loaded",self);
}

-(void)shutdown:(id)sender {
    [touchListener stop];
    [touchServer close];
	[super shutdown:sender];
}

#pragma mark Cleanup 

-(void)dealloc {
    [touchListener dealloc];
    [touchServer dealloc];
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
#pragma mark TDServer

- (id)directory {
    return touchServer.directory;
}

- (id)allDatabaseNames {
    return touchServer.allDatabaseNames;
}

- (id)allOpenDatabases {
    return touchServer.allOpenDatabases;
}

- (id)isValidDatabaseName:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString);
    return [NSNumber numberWithBool:[TDServer isValidDatabaseName:name]];
}

- (void)close:(id)args {
    [touchServer close];
}

- (id)databaseNamed:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString);
    
    TDDatabase * db = [touchServer databaseNamed:name];
    return db ? [[[TDDatabaseProxy alloc] initWithTDDatabase:db] autorelease] : nil;
}

- (id)existingDatabaseNamed:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString);

    TDDatabase * db = [touchServer existingDatabaseNamed:name];
    return db ? [[[TDDatabaseProxy alloc] initWithTDDatabase:db] autorelease] : nil;
}

- (id)deleteDatabaseNamed:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString);
    return [NSNumber numberWithBool:[touchServer deleteDatabaseNamed:name]];
}

#pragma mark -
#pragma mark TDListener

- (void)startListenerOnPort:(id)args {
    NSAssert(touchServer, @"TouchDB not present!");

    NSNumber * port;
    KrollCallback * cb;

    ENSURE_ARG_AT_INDEX(port, args, 0, NSNumber);
    ENSURE_ARG_OR_NULL_AT_INDEX(cb, args, 1, KrollCallback);

    // destroy any existing listener
    [touchListener stop];
    RELEASE_TO_NIL(touchListener);

    touchListener = [[TDListener alloc] initWithTDServer:touchServer port:[port intValue]];
    [touchListener start];

    NSLog(@"Started TouchDB listener on port %@", port);

    [cb call:nil thisObject:nil];
}



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

- (KrollCallback *)compileJavascriptFunction:(NSString *)source {
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

#pragma mark TDViewCompiler

- (TDMapBlock)compileMapFunction:(NSString*)mapSource language:(NSString*)language {
    if (![@"javascript" isEqualToString:language])
        return nil;

    KrollCallback * cb = [self compileJavascriptFunction:mapSource];

    TDMapBlock result = ^(NSDictionary* doc, TDMapEmitBlock emit) {
        emit_block = emit;
        [cb call:[NSArray arrayWithObject:doc] thisObject:nil];
    };

    return [[result copy] autorelease];
}

- (TDReduceBlock)compileReduceFunction:(NSString*)reduceSource language:(NSString*)language {
    if (![@"javascript" isEqualToString:language])
        return nil;

    KrollCallback * cb = [self compileJavascriptFunction:reduceSource];
    TDReduceBlock result = ^(NSArray* keys, NSArray* values, BOOL rereduce) {
        return [cb call:[NSArray arrayWithObjects:keys, values, nil] thisObject:nil];
    };

    return [[result copy] autorelease];
}

@end
