//
//  TDReplicationProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TDReplicationProxy.h"
#import "TDDatabaseProxy.h"
#import "TDAuthenticatorProxy.h"
#import "TiProxy+Errors.h"

extern NSString * CBL_ReplicatorProgressChangedNotification;
extern NSString * CBL_ReplicatorStoppedNotification;

@interface TDReplicationProxy ()
@property (nonatomic, assign) TDDatabaseProxy * database;
@property (nonatomic, strong) CBLReplication * replication;
@property (nonatomic, strong) TDAuthenticatorProxy * authenticatorProxy;
- (void)startObservingReplication:(CBLReplication*)repl;
- (void)stopObservingReplication:(CBLReplication*)repl;
@end

@implementation TDReplicationProxy

+ (instancetype)proxyWithDatabase:(TDDatabaseProxy *)database replication:(CBLReplication *)replication {
    return [[[TDReplicationProxy alloc] initWithDatabase:database replication:replication] autorelease];
}

- (id)initWithDatabase:(TDDatabaseProxy *)database replication:(CBLReplication *)replication {
    if (self = [super _initWithPageContext:database.pageContext]) {
        self.database = database;
        self.replication = replication;

        [self startObservingReplication:self.replication];
    }
    return self;
}

- (void)dealloc {
    [self stopObservingReplication:self.replication];
    [super dealloc];
}

#pragma mark Replication Configuration

- (id)remoteUrl {
    return [self.replication.remoteURL absoluteString];
}

- (id)isPull {
    return NUMBOOL(self.replication.pull);
}

- (id)isRunning {
    return NUMBOOL(self.replication.running);
}

- (id)createTarget {
    return NUMBOOL(self.replication.createTarget);
}

- (void)setCreateTarget:(id)value {
    self.replication.createTarget = [value boolValue];
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

- (id)filterParams {
    return self.replication.filterParams;
}

- (void)setFilterParams:(id)value {
    self.replication.filterParams = value;
}

- (id)docIDs {
    return self.replication.documentIDs;
}

- (void)setDocIDs:(id)value {
    ENSURE_ARRAY(value)
    self.replication.documentIDs = value;
}

- (id)headers {
    return self.replication.headers;
}

- (void)setHeaders:(id)value {
    ENSURE_DICT(value)
    self.replication.headers = value;
}

- (id)localDatabase {
    return self.database;
}

- (id)network {
    return self.replication.network;
}

- (void)setNetwork:(id)value {
    self.replication.network = value;
}

#pragma mark Authentication

- (void)setAuthenticator:(id)value {
    self.authenticatorProxy = value;
    self.replication.authenticator = self.authenticatorProxy.authenticator;
}

- (id)authenticator {
    return self.authenticatorProxy;
}

- (void)setCredential:(id)value {
    ENSURE_DICT(value)
    NSDictionary * cred = value;
    self.replication.credential = [NSURLCredential credentialWithUser:cred[@"user"] password:cred[@"pass"] persistence:NSURLCredentialPersistenceForSession];
}

#pragma mark Replication Status

- (void)start:(id)args {
    [self.replication start];
}

- (void)stop:(id)args {
    [self.replication stop];
}

- (void)restart:(id)args {
    [self.replication restart];
}

- (id)running {
    return NUMBOOL(self.replication.running);
}

- (id)completedChangesCount {
    return NUMINT(self.replication.completedChangesCount);
}

- (id)changesCount {
    return NUMINT(self.replication.changesCount);
}

- (id)lastError {
    return [self errorDict:self.replication.lastError];
}

- (id)status {
    return NUMINT(self.replication.status);
}

#pragma mark Notifications

#define kReplicationChangedEventName @"change"
#define kReplicationStoppedEventName @"status"

- (void)startObservingReplication:(CBLReplication*)repl {
    [repl addObserver:self forKeyPath:@"completedChangesCount" options:0 context:NULL];
    [repl addObserver:self forKeyPath:@"changesCount" options:0 context:NULL];
    [repl addObserver:self forKeyPath:@"status" options:0 context:NULL];
}

- (void)stopObservingReplication:(CBLReplication*)repl {
    [repl removeObserver:self forKeyPath:@"completedChangesCount"];
    [repl removeObserver:self forKeyPath:@"changesCount"];
    [repl removeObserver:self forKeyPath:@"status"];
}

- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary *)change context:(void *)context {
    CBLReplication * repl = (CBLReplication *)object;
    if ([@"status" isEqualToString:keyPath]) {
        // fire status event
        TiThreadPerformOnMainThread(^{
            [self fireEvent:kReplicationStoppedEventName withObject:@{@"status":NUMINT(repl.status)} propagate:YES];
        }, NO);
    }
    else {
        // fire change event
        TiThreadPerformOnMainThread(^{
            [self fireEvent:kReplicationChangedEventName withObject:nil propagate:YES];
        }, NO);
    }
}

@end
