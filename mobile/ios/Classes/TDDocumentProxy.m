//
//  TDDocumentProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TDDocumentProxy.h"
#import "TiProxy+Errors.h"
#import "TDRevisionProxy.h"

@interface TDDocumentProxy ()
@property (nonatomic, strong) CBLDocument * document;
@end

@implementation TDDocumentProxy

{
    NSError * lastError;
}

- (id)initWithCBLDocument:(CBLDocument *)document {
    if (self = [super init]) {
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
    CBLRevision * revision = [self.document currentRevision];
    if (revision) {
        return [[TDRevisionProxy alloc] initWithCBLRevision:revision];
    }
    else {
        return nil;
    }
}

- (id)revisionWithID:(id)args {
    NSString * revID;
    ENSURE_ARG_AT_INDEX(revID, args, 0, NSString)
    
    RELEASE_TO_NIL(lastError)

    CBLRevision * revision = [self.document revisionWithID:revID];
    if (revision) {
        return [[TDRevisionProxy alloc] initWithCBLRevision:revision];
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
    for (CBLRevision * rev in revs) {
        [result addObject:[[TDRevisionProxy alloc] initWithCBLRevision:rev]];
    }
    return result;
}

- (id)getLeafRevisions:(id)args {
    RELEASE_TO_NIL(lastError)

    NSArray * revs = [self.document getLeafRevisions:&lastError];
    [lastError retain];
    
    if (lastError) return nil;
    
    NSMutableArray * result = [NSMutableArray arrayWithCapacity:[revs count]];
    for (CBLRevision * rev in revs) {
        [result addObject:[[TDRevisionProxy alloc] initWithCBLRevision:rev]];
    }
    return result;
}

- (id)newRevision:(id)args {
    RELEASE_TO_NIL(lastError)

    CBLNewRevision * rev = [self.document newRevision];
    return rev ? [[CBLNewRevisionProxy alloc] initWithCBLNewRevision:rev] : nil;
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

    CBLRevision * rev = [self.document putProperties:props error:&lastError];
    [lastError retain];
    return rev ? [[TDRevisionProxy alloc] initWithCBLRevision:rev] : nil;
}

#pragma mark Change Notifications

#define kDocumentChangedEventName @"change"

- (void)documentChanged:(NSNotification *)notification {
    [self fireEvent:kDocumentChangedEventName withObject:notification.userInfo];
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
