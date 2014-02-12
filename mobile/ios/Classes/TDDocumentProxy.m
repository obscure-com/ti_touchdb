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

@interface TDDocumentProxy ()
@property (nonatomic, assign) TDDatabaseProxy * database;
@property (nonatomic, strong) CBLDocument * document;
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
        self.database = database;
        self.document = document;
    }
    return self;
}

- (void)dealloc {
    RELEASE_TO_NIL(lastError)
    [super dealloc];
}

- (id)error {
    return lastError ? [self errorDict:lastError] : nil;
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
    BOOL result = [self.document deleteDocument:&lastError];
    [lastError retain];
    return NUMBOOL(result);
}

- (id)purgeDocument:(id)args {
    RELEASE_TO_NIL(lastError)
    BOOL result = [self.document purgeDocument:&lastError];
    [lastError retain];
    return NUMBOOL(result);
}

#pragma mark REVISIONS:

- (id)currentRevisionID {
    return [self.document currentRevisionID];
}

- (id)currentRevision {
    CBLSavedRevision * revision = [self.document currentRevision];
    if (revision) {
        return [TDSavedRevisionProxy proxyWithDocument:self savedRevision:revision];
    }
    else {
        return nil;
    }
}

- (id)revisionWithID:(id)args {
    NSString * revID;
    ENSURE_ARG_AT_INDEX(revID, args, 0, NSString)
    
    RELEASE_TO_NIL(lastError)

    CBLSavedRevision * revision = [self.document revisionWithID:revID];
    if (revision) {
        return [TDSavedRevisionProxy proxyWithDocument:self savedRevision:revision];
    }
    else {
        return nil;
    }
}

- (id)getRevisionHistory:(id)args {
    RELEASE_TO_NIL(lastError)

    NSArray * revs = [self.document getRevisionHistory:&lastError];
    [lastError retain];
    
    if (lastError) return nil;
    
    NSMutableArray * result = [NSMutableArray arrayWithCapacity:[revs count]];
    for (CBLSavedRevision * rev in revs) {
        [result addObject:[TDSavedRevisionProxy proxyWithDocument:self savedRevision:rev]];
    }
    return result;
}

- (id)getLeafRevisions:(id)args {
    RELEASE_TO_NIL(lastError)

    NSArray * revs = [self.document getLeafRevisions:&lastError];
    [lastError retain];
    
    if (lastError) return nil;
    
    NSMutableArray * result = [NSMutableArray arrayWithCapacity:[revs count]];
    for (CBLSavedRevision * rev in revs) {
        [result addObject:[TDSavedRevisionProxy proxyWithDocument:self savedRevision:rev]];
    }
    return result;
}

- (id)createRevision:(id)args {
    RELEASE_TO_NIL(lastError)

    CBLUnsavedRevision * rev = [self.document newRevision];
    return rev ? [TDUnsavedRevisionProxy proxyWithDocument:self unsavedRevision:rev] : nil;
}

#pragma mark Document Properties

- (id)properties {
    return self.document.properties;
}

- (id)userProperties {
    return self.document.userProperties;
}

- (id)propertyForKey:(id)args {
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
    return rev ? [TDSavedRevisionProxy proxyWithDocument:self savedRevision:rev] : nil;
}

#pragma mark Change Notifications

#define kDocumentChangedEventName @"change"

- (void)documentChanged:(NSNotification *)notification {
    [self fireEvent:kDocumentChangedEventName withObject:nil];
}

- (void)_listenerAdded:(NSString*)type count:(int)count {
    if ([kDocumentChangedEventName isEqualToString:type] && count == 0) {
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(documentChanged:) name:kCBLDocumentChangeNotification object:nil];
    }
}

- (void)_listenerRemoved:(NSString*)type count:(int)count {
    if ([kDocumentChangedEventName isEqualToString:type] && count == 0) {
        [[NSNotificationCenter defaultCenter] removeObserver:self name:kCBLDocumentChangeNotification object:nil];
    }
}


@end
