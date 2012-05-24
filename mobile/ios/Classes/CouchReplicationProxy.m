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
#import <TouchDB/TDReplicator.h>

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

- (NSDictionary *)toStatusDictionary {
    return [NSDictionary dictionaryWithObjectsAndKeys:
            [self completed], @"completed",
            [self total], @"total",
            [self status], @"status",
            [self error], @"error",
            [self running], @"running",
            nil];
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
    TiThreadPerformOnMainThread(^{
        [self.replication start];
    }, NO);
}

- (void)stop:(id)args {
    TiThreadPerformOnMainThread(^{
        [self.replication stop];
    }, NO);
}

#pragma mark EVENTS

#define kReplicatorProgressChanged @"progress"
#define kReplicatorStopped @"stopped"

- (void)replicatorProgressChanged:(NSNotification *)n {
    [self fireEvent:kReplicatorProgressChanged withObject:[self toStatusDictionary]];
}

- (void)replicatorStopped:(NSNotification *)n {
    [self fireEvent:kReplicatorStopped withObject:[self toStatusDictionary]];
}

- (void)_listenerAdded:(NSString *)type count:(int)count {
	if (count == 1) {
        if ([type isEqualToString:kReplicatorProgressChanged]) {
            [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(replicatorProgressChanged:) name:TDReplicatorProgressChangedNotification object:nil];
        }
        else if ([type isEqualToString:kReplicatorStopped]) {
            [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(replicatorStopped:) name:TDReplicatorStoppedNotification object:nil];
        }
    }
}

- (void)_listenerRemoved:(NSString *)type count:(int)count {
	if (count == 0) {
        if ([type isEqualToString:kReplicatorProgressChanged]) {
            [[NSNotificationCenter defaultCenter] removeObserver:self name:TDReplicatorProgressChangedNotification object:nil];
        }
        else if ([type isEqualToString:kReplicatorStopped]) {
            [[NSNotificationCenter defaultCenter] removeObserver:self name:TDReplicatorStoppedNotification object:nil];
        }
    }
}

@end
