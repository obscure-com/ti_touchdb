//
//  TDDatabaseProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TDDatabaseProxy.h"
#import "TiProxy+Errors.h"
#import "TDDocumentProxy.h"
#import "TDQueryProxy.h"
#import "TDViewProxy.h"
#import "TDReplicationProxy.h"
#import "TDBridge.h"

@interface TDDatabaseProxy ()
@property (nonatomic, strong) TDDatabase * database;
@property (nonatomic, strong) NSMutableDictionary * documentProxyCache;
@end

@implementation TDDatabaseProxy

{
    NSError * lastError;
}

extern NSString* const kTDDatabaseChangeNotification;

- (id)initWithTDDatabase:(TDDatabase *)database {
    if (self = [super init]) {
        self.database = database;
        self.documentProxyCache = [NSMutableDictionary dictionary];
    }
    return self;
}

- (NSString *)description {
    return [NSString stringWithFormat:@"TDDatabaseProxy [%@]", self.database.name];
}

#pragma mark Database Properties

- (id)name {
    return self.database.name;
}

- (id)lastSequenceNumber {
    return [NSNumber numberWithInt:self.database.lastSequenceNumber];
}

- (id)documentCount {
    return [NSNumber numberWithInt:self.database.documentCount];
}

#pragma mark Public API

- (id)deleteDatabase:(id)args {
    RELEASE_TO_NIL(lastError)

    BOOL result = [self.database deleteDatabase:&lastError];
    return NUMBOOL(result);
}

- (id)documentWithID:(id)args {
    NSString * docID;
    ENSURE_ARG_OR_NULL_AT_INDEX(docID, args, 0, NSString);
    
    RELEASE_TO_NIL(lastError)
    
    if (!docID) {
        return [self untitledDocument:nil];
    }
    
    TDDocumentProxy * proxy = [self.documentProxyCache objectForKey:docID];
    if (!proxy) {
        TDDocument * doc = [self.database documentWithID:docID];
        if (!doc) {
            return nil;
        }
        proxy = [[TDDocumentProxy alloc] initWithTDDocument:doc];
        [self.documentProxyCache setObject:proxy forKey:docID];
    }
    return proxy;
}

- (id)error {
    return lastError ? [self errorDict:lastError] : nil;
}

- (id)untitledDocument:(id)args {
    RELEASE_TO_NIL(lastError)
    
    TDDocument * doc = [self.database untitledDocument];
    TDDocumentProxy * proxy = [[TDDocumentProxy alloc] initWithTDDocument:doc];
    [self.documentProxyCache setObject:proxy forKey:doc.documentID];
    return proxy;
}

- (id)cachedDocumentWithID:(id)args {
    NSString * docID;
    ENSURE_ARG_OR_NULL_AT_INDEX(docID, args, 0, NSString);

    RELEASE_TO_NIL(lastError)
    
    return [self.documentProxyCache objectForKey:docID];
}

- (void)clearDocumentCache:(id)args {
    RELEASE_TO_NIL(lastError)
    
    [self.documentProxyCache removeAllObjects];
    [self.database clearDocumentCache];
}

#pragma mark Queries and Views

- (id)queryAllDocuments:(id)args {
    RELEASE_TO_NIL(lastError)
    
    TDQuery * query = [self.database queryAllDocuments];
    return [[TDQueryProxy alloc] initWithTDQuery:query];
}

- (id)slowQueryWithMap:(id)args {
    KrollCallback * callback;
    ENSURE_ARG_AT_INDEX(callback, args, 0, KrollCallback);
    
    RELEASE_TO_NIL(lastError)
    
    TDMapBlock map = [[TDBridge sharedInstance] mapBlockForCallback:callback];
    TDQuery * query = [self.database slowQueryWithMap:map];
    return [[TDQueryProxy alloc] initWithTDQuery:query];
}

- (id)viewNamed:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString);
    
    RELEASE_TO_NIL(lastError)
    
    TDView * view = [self.database viewNamed:name];
    return [[TDViewProxy alloc] initWithTDView:view];
}

- (id)allViews {
    RELEASE_TO_NIL(lastError)
    
    NSArray * views = [self.database allViews];
    NSMutableArray * result = [NSMutableArray arrayWithCapacity:[views count]];
    for (TDView * view in views) {
        [result addObject:[[TDViewProxy alloc] initWithTDView:view]];
    }
    return result;
}

- (id)defineValidation:(id)args {
    NSString * name;
    KrollCallback * callback;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString);
    ENSURE_ARG_OR_NULL_AT_INDEX(callback, args, 1, KrollCallback);
    
    RELEASE_TO_NIL(lastError)
    
    if (callback) {
        TDValidationBlock validation = [[TDBridge sharedInstance] validationBlockForCallback:callback];
        [self.database defineValidation:name asBlock:validation];
    }
    else {
        [self.database defineValidation:name asBlock:nil];
    }
    
    return nil;
}

- (id)defineFilter:(id)args {
    NSString * name;
    KrollCallback * callback;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString);
    ENSURE_ARG_OR_NULL_AT_INDEX(callback, args, 1, KrollCallback);
    
    RELEASE_TO_NIL(lastError)
    
    if (callback) {
        TDFilterBlock filter = [[TDBridge sharedInstance] filterBlockForCallback:callback];
        [self.database defineFilter:name asBlock:filter];
    }
    else {
        [self.database defineFilter:name asBlock:nil];
    }
    
    return nil;
}

#pragma mark Replication

- (id)pushToURL:(id)args {
    NSString * urlstr;
    ENSURE_ARG_AT_INDEX(urlstr, args, 0, NSString);
    
    RELEASE_TO_NIL(lastError)
    
    NSURL * url = [NSURL URLWithString:urlstr];
    TDReplication * replication = [self.database pushToURL:url];
    return [[TDReplicationProxy alloc] initWithTDReplication:replication];
}

- (id)pullFromURL:(id)args {
    NSString * urlstr;
    ENSURE_ARG_AT_INDEX(urlstr, args, 0, NSString);
    
    RELEASE_TO_NIL(lastError)
    
    NSURL * url = [NSURL URLWithString:urlstr];
    TDReplication * replication = [self.database pullFromURL:url];
    return [[TDReplicationProxy alloc] initWithTDReplication:replication];
}

- (id)replicateWithURL:(id)args {
    NSString * urlstr;
    NSNumber * exclusive;
    ENSURE_ARG_AT_INDEX(urlstr, args, 0, NSString);
    ENSURE_ARG_OR_NULL_AT_INDEX(exclusive, args, 1, NSNumber);
    
    RELEASE_TO_NIL(lastError)
    
    NSURL * url = [NSURL URLWithString:urlstr];
    NSArray * repls = [self.database replicateWithURL:url exclusively:[exclusive boolValue]];
    
    NSMutableArray * result = [NSMutableArray arrayWithCapacity:[repls count]];
    for (TDReplication * repl in repls) {
        [result addObject:[[TDReplicationProxy alloc] initWithTDReplication:repl]];
    }
    return result;
}

#pragma mark Change Notifications

#define kDatabaseChangedEventName @"change"

- (void)databaseChanged:(NSNotification *)notification {
    [self fireEvent:kDatabaseChangedEventName withObject:notification.userInfo];
}

- (void)_listenerAdded:(NSString*)type count:(int)count {
    if ([kDatabaseChangedEventName isEqualToString:type] && count == 0) {
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(databaseChanged:) name:kTDDatabaseChangeNotification object:nil];
    }
}

- (void)_listenerRemoved:(NSString*)type count:(int)count {
    if ([kDatabaseChangedEventName isEqualToString:type] && count == 0) {
        [[NSNotificationCenter defaultCenter] removeObserver:self name:kTDDatabaseChangeNotification object:nil];
    }
}

@end
