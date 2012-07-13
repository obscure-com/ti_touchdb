//
//  CouchPersistentReplicationProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 4/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CouchPersistentReplicationProxy.h"
#import "TiProxy+Errors.h"

@implementation CouchPersistentReplicationProxy

@synthesize replication;

- (id)initWithCouchPersistentReplication:(CouchPersistentReplication *)rep {
    if (self = [super init]) {
        self.replication = rep;
    }
    return self;
}

+ (CouchPersistentReplicationProxy *)proxyWith:(CouchPersistentReplication *)rep {
    return rep ? [[[CouchPersistentReplicationProxy alloc] initWithCouchPersistentReplication:rep] autorelease] : nil;
}

/* TODO
- (id)source {
    return self.replication.source;
}

- (id)target {
    return self.replication.target;
}
*/

- (id)remoteURL {
    return [self.replication.remoteURL absoluteString];
}

- (id)createTarget {
    return [NSNumber numberWithBool:self.replication.create_target];
}

- (void)setCreateTarget:(id)val {
    self.replication.create_target = [val boolValue];
}

- (id)continuous {
    return [NSNumber numberWithBool:self.replication.continuous];
}

- (void)setContinuous:(id)val {
    self.replication.continuous = [val boolValue];
}

- (id)filter {
    return self.replication.filter;
}

- (void)setFilter:(id)val {
    self.replication.filter = val;
}

- (id)filterParams {
    return self.replication.query_params;
}

- (id)setFilterParams:(id)val {
    self.replication.query_params = val;
}

- (void)actAsUserWithRoles:(id)args {
    NSString * username;
    NSArray * roles;
    
    ENSURE_ARG_OR_NIL_AT_INDEX(username, args, 0, NSString)
    ENSURE_ARG_OR_NIL_AT_INDEX(roles, args, 1, NSArray)
    
    [self.replication actAsUser:username withRoles:roles];
}

- (void)actAsAdmin:(id)args {
    [self.replication actAsAdmin];
}

- (void)restart:(id)args {
    [self.replication restart];
}

- (id)status {
    return [NSNumber numberWithInt:self.replication.state];
}

- (id)completed {
    return [NSNumber numberWithBool:self.replication.completed];
}

- (id)total {
    return [NSNumber numberWithUnsignedInt:self.replication.total];
}

- (id)error {
    return [self errorDict:self.replication.error];
}

- (id)mode {
    return [NSNumber numberWithInt:self.replication.mode];
}

@end
