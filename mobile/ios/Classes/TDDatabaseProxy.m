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
@property (nonatomic, strong) CBLDatabase * database;
@property (nonatomic, strong) NSMutableDictionary * documentProxyCache;
@end

@implementation TDDatabaseProxy

{
    NSError * lastError;
}

extern NSString* const kCBLDatabaseChangeNotification;

- (id)initWithCBLDatabase:(CBLDatabase *)database {
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
        CBLDocument * doc = [self.database documentWithID:docID];
        if (!doc) {
            return nil;
        }
        proxy = [[TDDocumentProxy alloc] initWithCBLDocument:doc];
        [self.documentProxyCache setObject:proxy forKey:docID];
    }
    return proxy;
}

- (id)error {
    return lastError ? [self errorDict:lastError] : nil;
}

- (id)untitledDocument:(id)args {
    RELEASE_TO_NIL(lastError)
    
    CBLDocument * doc = [self.database untitledDocument];
    TDDocumentProxy * proxy = [[TDDocumentProxy alloc] initWithCBLDocument:doc];
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
    
    CBLQuery * query = [self.database queryAllDocuments];
    return [[TDQueryProxy alloc] initWithCBLQuery:query];
}

- (id)slowQueryWithMap:(id)args {
    KrollCallback * callback;
    ENSURE_ARG_AT_INDEX(callback, args, 0, KrollCallback);
    
    RELEASE_TO_NIL(lastError)
    
    CBLMapBlock map = [[TDBridge sharedInstance] mapBlockForCallback:callback];
    CBLQuery * query = [self.database slowQueryWithMap:map];
    return [[TDQueryProxy alloc] initWithCBLQuery:query];
}

- (id)viewNamed:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString);
    
    RELEASE_TO_NIL(lastError)
    
    CBLView * view = [self.database viewNamed:name];
    return [[TDViewProxy alloc] initWithCBLView:view];
}

- (id)allViews {
    RELEASE_TO_NIL(lastError)
    
    NSArray * views = [self.database allViews];
    NSMutableArray * result = [NSMutableArray arrayWithCapacity:[views count]];
    for (CBLView * view in views) {
        [result addObject:[[TDViewProxy alloc] initWithCBLView:view]];
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
        CBLValidationBlock validation = [[TDBridge sharedInstance] validationBlockForCallback:callback];
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
        CBLFilterBlock filter = [[TDBridge sharedInstance] filterBlockForCallback:callback];
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
    CBLReplication * replication = [self.database pushToURL:url];
    return [[TDReplicationProxy alloc] initWithCBLReplication:replication];
}

- (id)pullFromURL:(id)args {
    NSString * urlstr;
    ENSURE_ARG_AT_INDEX(urlstr, args, 0, NSString);
    
    RELEASE_TO_NIL(lastError)
    
    NSURL * url = [NSURL URLWithString:urlstr];
    CBLReplication * replication = [self.database pullFromURL:url];
    return [[TDReplicationProxy alloc] initWithCBLReplication:replication];
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
    for (CBLReplication * repl in repls) {
        [result addObject:[[TDReplicationProxy alloc] initWithCBLReplication:repl]];
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
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(databaseChanged:) name:kCBLDatabaseChangeNotification object:nil];
    }
}

- (void)_listenerRemoved:(NSString*)type count:(int)count {
    if ([kDatabaseChangedEventName isEqualToString:type] && count == 0) {
        [[NSNotificationCenter defaultCenter] removeObserver:self name:kCBLDatabaseChangeNotification object:nil];
    }
}

@end
