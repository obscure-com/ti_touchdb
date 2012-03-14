/**
 * $Id$
 * 
 * Copyright (c) 2012 Paul Mietz Egli
 * Licensed under the Apache Public License version 2.
 */

#import "TDDatabaseProxy+Replication.h"
#import <TouchDB/TDDatabase+Replication.h>
#import <TouchDB/TDPusher.h>

@implementation TDDatabaseProxy (Replication)

#pragma mark -
#pragma mark Helper Methods

- (id)replicateDatabase:(id)args {
    NSString * remote;
    NSNumber * push;
    NSDictionary * options;
    
    ENSURE_ARG_AT_INDEX(remote, args, 0, NSString);
    ENSURE_ARG_AT_INDEX(push, args, 1, NSNumber);
    ENSURE_ARG_OR_NULL_AT_INDEX(options, args, 2, NSDictionary);
    
    NSURL * remoteUrl = [NSURL URLWithString:remote];
    BOOL continuous = [[options objectForKey:@"continuous"] boolValue];
    BOOL cancel = [[options objectForKey:@"cancel"] boolValue];
    BOOL createTarget = [[options objectForKey:@"create_target"] boolValue];
    
    if (!cancel) {
        // start a new replication
        TDReplicator * repl = [self.database replicatorWithRemoteURL:remoteUrl push:[push boolValue] continuous:continuous];
        if (!repl) {
            return [NSNumber numberWithInt:500];
        }

        // TODO filters
        
        if ([push boolValue]) {
            ((TDPusher *)repl).createTarget = createTarget;
        }
        
        // replication is an asynchronous process that depends on the starting
        // thread to be around through the lifetime of the NSURLConnection.  It
        // looks like we can't guarantee that this will be the case in a call to
        // a module, but wrapping the start message call in an NSOperation seems
        // to work fine.
        [[NSOperationQueue mainQueue] addOperation:[NSBlockOperation blockOperationWithBlock:^{
            [repl start];
        }]];
    }
    else {
        TDReplicator * repl = [self.database activeReplicatorWithRemoteURL:remoteUrl push:[push boolValue]];
        if (!repl) {
            return [NSNumber numberWithInt:404];
        }
        [repl stop];
    }
    return [NSNumber numberWithInt:200];
}

@end
