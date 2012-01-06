/**
 * $Id$
 * 
 * Copyright (c) 2012 Paul Mietz Egli
 * Licensed under the Apache Public License version 2.
 *
 * Appcelerator Titanium is Copyright (c) 2009-2010 by Appcelerator, Inc.
 * and licensed under the Apache Public License (version 2)
 */


#import "ComObscureTi_touchdbModule.h"
#import "TiBase.h"
#import "TiHost.h"
#import "TiUtils.h"

#import <TouchDB/TDServer.h>
#import <TouchDBListener/TDListener.h>

@implementation ComObscureTi_touchdbModule

TDServer * touchServer;
TDListener * touchListener;

#pragma mark Internal

-(id)moduleGUID {
	return @"d9e122ec-cc6c-4987-85df-0a90523e738c";
}

-(NSString*)moduleId {
	return @"com.obscure.ti_touchdb";
}

#pragma mark Lifecycle

- (void)startTouchDBServer {
    // fire up TDServer
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

- (void)startTouchDBListener {
    NSAssert(touchServer, @"TouchDB not present!");
    touchListener = [[TDListener alloc] initWithTDServer:touchServer port:5985]; // TODO randomize!
    [touchListener start];
    
    NSString * status = [NSString stringWithContentsOfURL:[NSURL URLWithString:@"http://localhost:5985/"] encoding:NSUTF8StringEncoding error:nil];
    NSLog(@"Started TouchDB: %@", status);
}

-(void)startup {
	[super startup];

	[self startTouchDBServer];
    [self startTouchDBListener];
//    [TDView setCompiler:self];
    
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

#pragma Public APIs


@end
