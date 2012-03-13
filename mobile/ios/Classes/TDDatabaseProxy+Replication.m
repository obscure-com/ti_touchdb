/**
 * $Id$
 * 
 * Copyright (c) 2012 Paul Mietz Egli
 * Licensed under the Apache Public License version 2.
 */

#import "TDDatabaseProxy+Replication.h"
#import <TouchDB/TDDatabase+Replication.h>

@implementation TDDatabaseProxy (Replication)

#pragma mark -
#pragma mark Helper Methods

- (id)replicateDatabase:(id)args {
    TDDatabaseProxy * proxy;
    NSString * remote;
    NSNumber * push;
    NSDictionary * options;
    
    ENSURE_ARG_AT_INDEX(proxy, args, 0, TDDatabaseProxy);
    ENSURE_ARG_AT_INDEX(remote, args, 0, NSString);
    ENSURE_ARG_AT_INDEX(push, args, 0, NSNumber);
    ENSURE_ARG_OR_NULL_AT_INDEX(options, args, 0, NSDictionary);
    
    
}

/*

- (TDStatus) do_POST_replicate {
    // Extract the parameters from the JSON request body:
    // http://wiki.apache.org/couchdb/Replication
    TDDatabase* db;
    NSURL* remote;
    BOOL push, createTarget;
    NSDictionary* body = self.bodyAsDictionary;
    TDStatus status = [_server.replicatorManager parseReplicatorProperties: body
                                                                toDatabase: &db remote: &remote
                                                                    isPush: &push
                                                              createTarget: &createTarget];
    if (status >= 300)
        return status;
    
    BOOL continuous = [$castIf(NSNumber, [body objectForKey: @"continuous"]) boolValue];
    BOOL cancel = [$castIf(NSNumber, [body objectForKey: @"cancel"]) boolValue];
    if (!cancel) {
        // Start replication:
        TDReplicator* repl = [db replicatorWithRemoteURL: remote push: push continuous: continuous];
        if (!repl)
            return 500;
        repl.filterName = $castIf(NSString, [body objectForKey: @"filter"]);;
        repl.filterParameters = $castIf(NSDictionary, [body objectForKey: @"query_params"]);
        if (push)
            ((TDPusher*)repl).createTarget = createTarget;
        [repl start];
        _response.bodyObject = $dict({@"session_id", repl.sessionID});
    } else {
        // Cancel replication:
        TDReplicator* repl = [db activeReplicatorWithRemoteURL: remote push: push];
        if (!repl)
            return 404;
        [repl stop];
    }
    return 200;
}
*/

@end
