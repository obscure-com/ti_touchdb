//
//  CouchReplicationProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 4/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CouchReplicationProxy.h"
#import "TiProxy+Errors.h"
#import <CouchCocoa/CouchReplication.h>
#import <CouchCocoa/RESTOperation.h>

@implementation CouchReplicationProxy

@synthesize replication;

- (id)initWithCouchReplication:(CouchReplication *)rep {
    if (self = [super init]) {
        self.replication = rep;
    }
    return self;
}

+ (CouchReplicationProxy *)proxyWith:(CouchReplication *)rep {
    return rep ? [[[CouchReplicationProxy alloc] initWithCouchReplication:rep] autorelease] : nil;
}

#pragma mark PROPERTIES

- (id)createTarget {
    return [NSNumber numberWithBool:self.replication.createTarget];
}

- (void)setCreateTarget:(id)val {
    self.replication.createTarget = [val boolValue];
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
    return self.replication.filterParams;
}

- (void)setFilterParams:(id)val {
    self.replication.filterParams = val;
}

- (id)remoteURL {
    return [self.replication.remoteURL absoluteString];
}

- (id)pull {
    return [NSNumber numberWithBool:self.replication.pull];
}

- (id)running {
    return [NSNumber numberWithBool:self.replication.running];
}

- (id)status {
    return self.replication.status;
}

- (id)completed {
    return [NSNumber numberWithUnsignedInt:self.replication.completed];
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


#pragma mark METHODS

- (void)start:(id)args {
    KrollCallback * cb;
    ENSURE_ARG_OR_NIL_AT_INDEX(cb, args, 0, KrollCallback)
    
    RESTOperation * op = [self.replication start];
    if (cb) {
        [op onCompletion:^() {
            [cb call:[NSArray arrayWithObject:self] thisObject:nil];
        }];
    }
}

- (void)stop:(id)args {
    [self.replication stop];
}



@end
