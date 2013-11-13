//
//  TDReplicationProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TDReplicationProxy.h"
#import "TiProxy+Errors.h"

extern NSString * CBL_ReplicatorProgressChangedNotification;
extern NSString * CBL_ReplicatorStoppedNotification;

@interface TDReplicationProxy ()
@property (nonatomic, strong) CBLReplication * replication;
@end

@implementation TDReplicationProxy

- (id)initWithExecutionContext:(id<TiEvaluator>)context CBLReplication:(CBLReplication *)replication {
    if (self = [super _initWithPageContext:context]) {
        self.replication = replication;

        /*
         * replication progress events are sent from private CBL_Replication objects, not the
         * public CBLReplication that we get in this layer.  For this reason, we have to listen
         * for ALL CBL_ReplicatorProgressChangedNotification notifications and sort out which one
         * belongs to our CBLReplication in the handler method.
         */
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(replicationChanged:) name:CBL_ReplicatorProgressChangedNotification object:nil];
        
    }
    return self;
}

#pragma mark Replication Configuration

- (id)remoteURL {
    return [self.replication.remoteURL absoluteString];
}

- (id)pull {
    return NUMBOOL(self.replication.pull);
}

- (id)persistent {
    return NUMBOOL(self.replication.persistent);
}

- (void)setPersistent:(id)value {
    self.replication.persistent = [value boolValue];
}

- (id)create_target {
    return NUMBOOL(self.replication.create_target);
}

- (void)setCreate_target:(id)value {
    self.replication.create_target = [value boolValue];
}

- (id)continuous {
    return NUMBOOL(self.replication.continuous);
}

- (void)setContinuous:(id)value {
    self.replication.continuous = [value boolValue];
}

- (id)filter {
    return self.replication.filter;
}

- (void)setFilter:(id)value {
    ENSURE_STRING_OR_NIL(value)
    self.replication.filter = value;
}

- (id)query_params {
    return self.replication.query_params;
}

- (void)setQuery_params:(id)value {
    ENSURE_DICT(value)
    self.replication.query_params = value;
}

- (id)doc_ids {
    return self.replication.doc_ids;
}

- (void)setDoc_ids:(id)value {
    ENSURE_ARRAY(value)
    self.replication.doc_ids = value;
}

- (id)headers {
    return self.replication.headers;
}

- (void)setHeaders:(id)value {
    ENSURE_DICT(value)
    self.replication.headers = value;
}

#pragma mark Replication Status

- (void)start:(id)args {
    [self.replication start];
}

- (void)stop:(id)args {
    [self.replication stop];
}

- (id)running {
    return NUMBOOL(self.replication.running);
}

- (id)completed {
    return NUMINT(self.replication.completed);
}

- (id)total {
    return NUMINT(self.replication.total);
}

- (id)error {
    return [self errorDict:self.replication.error];
}

- (id)mode {
    return NUMINT(self.replication.mode);
}

#pragma mark Notifications

#define kReplicationChangedEventName @"change"

- (void)replicationChanged:(NSNotification *)notification {
    // very nasty, precious, looking at its internalzzz
    id bgrepl = [self.replication valueForKeyPath:@"_bg_replicator"];
    if (bgrepl == notification.object) {
        [self fireEvent:kReplicationChangedEventName withObject:nil propagate:YES];
    }
}

@end
