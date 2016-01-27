//
//  TDDocumentProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TDDocumentProxy.h"
#import "TiProxy+Errors.h"
#import "TDDatabaseProxy.h"
#import "TDRevisionProxy.h"
#import "TDDocumentChangeProxy.h"

@interface TDDocumentProxy ()
@property (nonatomic, strong) CBLDocument * document;
@property (nonatomic, strong) TDRevisionProxyBase * cachedCurrentRevision;
@end

@implementation TDDocumentProxy

{
    NSError * lastError;
}

+ (instancetype)proxyWithDatabase:(TDDatabaseProxy *)database document:(CBLDocument *)document {
    return [[[TDDocumentProxy alloc] initWithDatabase:database CBLDocument:document] autorelease];
}

- (id)initWithDatabase:(TDDatabaseProxy *)database CBLDocument:(CBLDocument *)document {
    if (self = [super _initWithPageContext:database.pageContext]) {
        self.db = database;
        self.document = document;
    }
    return self;
}

- (void)dealloc {
    RELEASE_TO_NIL(lastError)
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    [super dealloc];
}

- (id)error {
    return [self errorDict:lastError];
}

- (id)documentID {
    return [self.document documentID];
}

- (id)abbreviatedID {
    return [self.document abbreviatedID];
}

- (id)isDeleted {
    return [NSNumber numberWithBool:[self.document isDeleted]];
}

- (id)deleteDocument:(id)args {
    RELEASE_TO_NIL(lastError)
    [self.db _removeProxyForDocument:self.document.documentID];
    BOOL result = [self.document deleteDocument:&lastError];
    [lastError retain];
    if (result) {
        self.cachedCurrentRevision = nil;
    }
    return NUMBOOL(result);
}

- (id)purgeDocument:(id)args {
    RELEASE_TO_NIL(lastError)
    [self.db _removeProxyForDocument:self.document.documentID];
    BOOL result = [self.document purgeDocument:&lastError];
    [lastError retain];
    if (result) {
        self.cachedCurrentRevision = nil;
    }
    return NUMBOOL(result);
}

- (id)database {
    return self.db;
}

#pragma mark REVISIONS:

- (id)currentRevisionID {
    return [self.document currentRevisionID];
}

- (id)currentRevision {
    if (!self.document.currentRevision) return [NSNull null];
    
    if (![[self.cachedCurrentRevision revisionID] isEqualToString:self.document.currentRevisionID]) {
        self.cachedCurrentRevision = [TDSavedRevisionProxy proxyWithDocument:self savedRevision:self.document.currentRevision];
    }
    return self.cachedCurrentRevision;
}

- (id)getRevision:(id)args {
    NSString * revID;
    ENSURE_ARG_AT_INDEX(revID, args, 0, NSString)
    
    RELEASE_TO_NIL(lastError)

    CBLSavedRevision * revision = [self.document revisionWithID:revID];
    if (revision) {
        return [TDSavedRevisionProxy proxyWithDocument:self savedRevision:revision];
    }
    else {
        return [NSNull null];
    }
}

- (id)_revisionProxyArray:(NSArray *)revs {
    NSMutableArray * result = [NSMutableArray arrayWithCapacity:[revs count]];
    for (CBLSavedRevision * rev in revs) {
        [result addObject:[TDSavedRevisionProxy proxyWithDocument:self savedRevision:rev]];
    }
    return result;
}

- (id)revisionHistory {
    RELEASE_TO_NIL(lastError)

    NSArray * revs = [self.document getRevisionHistory:&lastError];
    [lastError retain];
    
    return lastError ? nil : [self _revisionProxyArray:revs];
}

- (id)leafRevisions {
    RELEASE_TO_NIL(lastError)

    NSArray * revs = [self.document getLeafRevisions:&lastError];
    [lastError retain];
    
    return lastError ? nil : [self _revisionProxyArray:revs];
}

- (id)createRevision:(id)args {
    RELEASE_TO_NIL(lastError)

    CBLUnsavedRevision * rev = [self.document newRevision];
    return rev ? [TDUnsavedRevisionProxy proxyWithDocument:self unsavedRevision:rev] : nil;
}

- (id)conflictingRevisions {
    RELEASE_TO_NIL(lastError)
    
    NSArray * revs = [self.document getConflictingRevisions:&lastError];
    [lastError retain];
    
    return lastError ? nil : [self _revisionProxyArray:revs];
}

#pragma mark Document Properties

- (id)properties {
    return self.document.properties;
}

- (id)userProperties {
    return self.document.userProperties;
}

- (id)getProperty:(id)args {
    NSString * key;
    ENSURE_ARG_AT_INDEX(key, args, 0, NSString)
    
    RELEASE_TO_NIL(lastError)

    return [self.document propertyForKey:key];
}

- (id)putProperties:(id)args {
    NSDictionary * props;
    ENSURE_ARG_AT_INDEX(props, args, 0, NSDictionary)
    
    RELEASE_TO_NIL(lastError)

    CBLSavedRevision * rev = [self.document putProperties:props error:&lastError];
    [lastError retain];
    
    if (!rev) return [NSNull null];
    
    self.cachedCurrentRevision = [TDSavedRevisionProxy proxyWithDocument:self savedRevision:rev];
    return self.cachedCurrentRevision;
}

#pragma mark Change Notifications

#define kDocumentChangedEventName @"change"

- (void)documentChanged:(NSNotification *)notification {
    TDDocumentChangeProxy * change = [TDDocumentChangeProxy proxyWithDocument:self documentChange:notification.userInfo[@"change"]];
    NSDictionary * e = @{ @"source": self, @"change": change };
    
    [self fireEvent:kDocumentChangedEventName withObject:e];
}

- (void)_listenerAdded:(NSString*)type count:(int)count {
    if ([kDocumentChangedEventName isEqualToString:type] && count == 1) {
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(documentChanged:) name:kCBLDocumentChangeNotification object:nil];
    }
}

- (void)_listenerRemoved:(NSString*)type count:(int)count {
    if ([kDocumentChangedEventName isEqualToString:type] && count < 1) {
        [[NSNotificationCenter defaultCenter] removeObserver:self name:kCBLDocumentChangeNotification object:nil];
    }
}


@end
