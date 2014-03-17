//
//  TDDatabaseProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TDDatabaseProxy.h"
#import "TiProxy+Errors.h"
#import "TDDatabaseManagerProxy.h"
#import "TDDocumentProxy.h"
#import "TDQueryProxy.h"
#import "TDViewProxy.h"
#import "TDReplicationProxy.h"
#import "TDBridge.h"

@interface TDDatabaseProxy ()
@property (nonatomic, assign) TDDatabaseManagerProxy * managerProxy;
@property (nonatomic, strong) CBLDatabase * database;
@property (nonatomic, strong) NSMutableDictionary * documentProxyCache;
@property (nonatomic, strong) NSMutableDictionary * filterCallbackCache;
@property (nonatomic, strong) NSMutableDictionary * validationCallbackCache;
- (id)initWithManager:(TDDatabaseManagerProxy *)manager database:(CBLDatabase *)database;
@end

@implementation TDDatabaseProxy

{
    NSError * lastError;
}

extern NSString* const kCBLDatabaseChangeNotification;

+ (instancetype)proxyWithManager:(TDDatabaseManagerProxy *)manager database:(CBLDatabase *)database {
    return [[[TDDatabaseProxy alloc] initWithManager:manager database:database] autorelease];
}

- (id)initWithManager:(TDDatabaseManagerProxy *)manager database:(CBLDatabase *)database {
    if (self = [super _initWithPageContext:manager.pageContext]) {
        self.managerProxy = manager;
        self.database = database;
        self.documentProxyCache = [NSMutableDictionary dictionary];
        self.filterCallbackCache = [NSMutableDictionary dictionary];
        self.validationCallbackCache = [NSMutableDictionary dictionary];
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

- (id)manager {
    return self.managerProxy;
}

- (id)maxRevTreeDepth {
    return NUMINT(self.database.maxRevTreeDepth);
}

- (void)setMaxRevTreeDepth:(id)value {
    self.database.maxRevTreeDepth = [value unsignedIntegerValue];
}

#pragma mark Public API

- (id)compact:(id)args {
    RELEASE_TO_NIL(lastError)

    BOOL result = [self.database compact:&lastError];
    return NUMBOOL(result);
}

- (id)deleteDatabase:(id)args {
    RELEASE_TO_NIL(lastError)

    [self.manager forgetDatabaseProxyNamed:self.database.name];
    BOOL result = [self.database deleteDatabase:&lastError];
    return NUMBOOL(result);
}

- (id)getDocument:(id)args {
    NSString * docID;
    ENSURE_ARG_OR_NULL_AT_INDEX(docID, args, 0, NSString);
    
    RELEASE_TO_NIL(lastError)
    
    if (!docID) {
        return [self createDocument:nil];
    }
    
    TDDocumentProxy * proxy = [self.documentProxyCache objectForKey:docID];
    if (!proxy) {
        CBLDocument * doc = [self.database documentWithID:docID];
        if (!doc) {
            return nil;
        }
        proxy = [TDDocumentProxy proxyWithDatabase:self document:doc];
        [self.documentProxyCache setObject:proxy forKey:docID];
    }
    return proxy;
}

- (id)getExistingDocument:(id)args {
    NSString * docID;
    ENSURE_ARG_AT_INDEX(docID, args, 0, NSString);
    return [self _existingDocumentWithID:docID];
}

- (TDDocumentProxy *)_existingDocumentWithID:(NSString *)documentID {
    RELEASE_TO_NIL(lastError)
    
    if (!documentID) {
        // TODO set lastError
        return nil;
    }
    
    TDDocumentProxy * proxy = [self.documentProxyCache objectForKey:documentID];
    if (!proxy) {
        CBLDocument * doc = [self.database existingDocumentWithID:documentID];
        if (!doc) {
            return nil;
        }
        proxy = [TDDocumentProxy proxyWithDatabase:self document:doc];
        [self.documentProxyCache setObject:proxy forKey:documentID];
    }
    return proxy;
}

- (void)_removeProxyForDocument:(NSString *)documentID {
    [self.documentProxyCache removeObjectForKey:documentID];
}

- (id)error {
    return lastError ? [self errorDict:lastError] : nil;
}

- (id)createDocument:(id)args {
    RELEASE_TO_NIL(lastError)
    
    CBLDocument * doc = [self.database createDocument];
    TDDocumentProxy * proxy = [TDDocumentProxy proxyWithDatabase:self document:doc];
    [self.documentProxyCache setObject:proxy forKey:doc.documentID];
    return proxy;
}

#pragma mark Local Documents

- (id)getExistingLocalDocumnet:(id)args {
    return nil;
}

- (id)deleteLocalDocument:(id)args {
    return nil;
}

- (id)putLocalDocument:(id)args {
    return nil;
}



#pragma mark Queries and Views

- (id)createAllDocumentsQuery:(id)args {
    RELEASE_TO_NIL(lastError)
    
    CBLQuery * query = [self.database createAllDocumentsQuery];
    return [TDQueryProxy proxyWithDatabase:self query:query];
}

- (id)slowQueryWithMap:(id)args {
    KrollCallback * callback;
    ENSURE_ARG_AT_INDEX(callback, args, 0, KrollCallback);
    
    RELEASE_TO_NIL(lastError)
    
    CBLMapBlock map = [[TDBridge sharedInstance] mapBlockForCallback:callback inExecutionContext:[self executionContext]];
    CBLQuery * query = [self.database slowQueryWithMap:map];
    return [TDQueryProxy proxyWithDatabase:self query:query];
}

- (id)getView:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString);
    
    RELEASE_TO_NIL(lastError)
    
    CBLView * view = [self.database viewNamed:name];
    return [TDViewProxy proxyWithDatabase:self view:view];
}

- (id)getExistingView:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString);
    
    RELEASE_TO_NIL(lastError)
    
    CBLView * view = [self.database existingViewNamed:name];
    return view ? [TDViewProxy proxyWithDatabase:self view:view] : nil;
}

- (id)getValidation:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString);

    return [self.validationCallbackCache objectForKey:name];
}

- (void)setValidation:(id)args {
    NSString * name;
    KrollCallback * callback;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString);
    ENSURE_ARG_OR_NULL_AT_INDEX(callback, args, 1, KrollCallback);
    
    RELEASE_TO_NIL(lastError)
    
    if (callback) {
        CBLValidationBlock validation = [[TDBridge sharedInstance] validationBlockInDatabase:self forCallback:callback];
        [self.database setValidationNamed:name asBlock:validation];
        [self.validationCallbackCache setObject:callback forKey:name];
    }
    else {
        [self.database setValidationNamed:name asBlock:nil];
        [self.validationCallbackCache removeObjectForKey:name];
    }
}

- (id)setFilter:(id)args {
    NSString * name;
    KrollCallback * callback;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString);
    ENSURE_ARG_OR_NULL_AT_INDEX(callback, args, 1, KrollCallback);
    
    RELEASE_TO_NIL(lastError)
    
    if (callback) {
        CBLFilterBlock filter = [[TDBridge sharedInstance] filterBlockForCallback:callback inExecutionContext:[self executionContext]];
        [self.database setFilterNamed:name asBlock:filter];
        [self.filterCallbackCache setObject:callback forKey:name];
    }
    else {
        [self.database setFilterNamed:name asBlock:nil];
        [self.filterCallbackCache removeObjectForKey:name];
    }
    
    return nil;
}

- (id)getFilter:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString);
    
    return [self.filterCallbackCache objectForKey:name];
}

#pragma mark Replication

- (id)allReplications {
    NSMutableArray * result = [NSMutableArray array];
    for (CBLReplication * r in [self.database allReplications]) {
        [result addObject:[TDReplicationProxy proxyWithDatabase:self replication:r]];
    }
    return result;
}

- (id)createPushReplication:(id)args {
    NSString * urlstr;
    ENSURE_ARG_AT_INDEX(urlstr, args, 0, NSString);
    
    RELEASE_TO_NIL(lastError)
    
    NSURL * url = [NSURL URLWithString:urlstr];
    CBLReplication * replication = [self.database replicationToURL:url];
    return [TDReplicationProxy proxyWithDatabase:self replication:replication];
}

- (id)createPullReplication:(id)args {
    NSString * urlstr;
    ENSURE_ARG_AT_INDEX(urlstr, args, 0, NSString);
    
    RELEASE_TO_NIL(lastError)
    
    NSURL * url = [NSURL URLWithString:urlstr];
    CBLReplication * replication = [self.database replicationFromURL:url];
    return [TDReplicationProxy proxyWithDatabase:self replication:replication];
}

/*
- (id)replicateWithURL:(id)args {
    NSString * urlstr;
    NSNumber * exclusive;
    ENSURE_ARG_AT_INDEX(urlstr, args, 0, NSString);
    ENSURE_ARG_OR_NULL_AT_INDEX(exclusive, args, 1, NSNumber);
    
    RELEASE_TO_NIL(lastError)
    
    NSURL * url = [NSURL URLWithString:urlstr];
    NSArray * repls = [self.database replicationsWithURL:url exclusively:[exclusive boolValue]];
    
    NSMutableArray * result = [NSMutableArray arrayWithCapacity:[repls count]];
    for (CBLReplication * repl in repls) {
        [result addObject:[[TDReplicationProxy alloc] initWithExecutionContext:[self executionContext] CBLReplication:repl]];
    }
    return result;
}
*/

- (id)internalURL {
    return self.database.internalURL;
}

#pragma mark Change Notifications

#define kDatabaseChangedEventName @"change"

- (void)databaseChanged:(NSNotification *)notification {
    [self fireEvent:kDatabaseChangedEventName withObject:nil];
}

- (void)_listenerAdded:(NSString*)type count:(int)count {
    if ([kDatabaseChangedEventName isEqualToString:type] && count == 1) {
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(databaseChanged:) name:kCBLDatabaseChangeNotification object:nil];
    }
}

- (void)_listenerRemoved:(NSString*)type count:(int)count {
    if ([kDatabaseChangedEventName isEqualToString:type] && count < 1) {
        [[NSNotificationCenter defaultCenter] removeObserver:self name:kCBLDatabaseChangeNotification object:nil];
    }
}

@end
