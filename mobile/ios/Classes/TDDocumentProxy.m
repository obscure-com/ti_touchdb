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
@property (nonatomic, strong) TDDocument * document;
@end

@implementation TDDocumentProxy

- (id)initWithTDDocument:(TDDocument *)document {
    if (self = [super init]) {
        self.document = document;
    }
    return self;
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
    NSError * error = nil;
    [self.document deleteDocument:&error];
    return [self errorDict:error];
}

- (id)purgeDocument:(id)args {
    NSError * error = nil;
    [self.document purgeDocument:&error];
    return [self errorDict:error];
}

#pragma mark REVISIONS:

- (id)currentRevisionID {
    return [self.document currentRevisionID];
}

- (id)currentRevision {
    TDRevision * revision = [self.document currentRevision];
    if (revision) {
        return [[TDRevisionProxy alloc] initWithTDRevision:revision];
    }
    else {
        return nil;
    }
}

- (id)revisionWithID:(id)args {
    NSString * revID;
    ENSURE_ARG_AT_INDEX(revID, args, 0, NSString)
    
    TDRevision * revision = [self.document revisionWithID:revID];
    if (revision) {
        return [[TDRevisionProxy alloc] initWithTDRevision:revision];
    }
    else {
        return nil;
    }
}

- (id)getRevisionHistory:(id)args {
    NSError * error = nil;
    NSArray * revs = [self.document getRevisionHistory:&error];
    
    if (error) return [self errorDict:error];
    
    NSMutableArray * result = [NSMutableArray arrayWithCapacity:[revs count]];
    for (TDRevision * rev in revs) {
        [result addObject:[[TDRevisionProxy alloc] initWithTDRevision:rev]];
    }
    return result;
}

- (id)getLeafRevisions:(id)args {
    NSError * error = nil;
    NSArray * revs = [self.document getLeafRevisions:&error];
    
    if (error) return [self errorDict:error];
    
    NSMutableArray * result = [NSMutableArray arrayWithCapacity:[revs count]];
    for (TDRevision * rev in revs) {
        [result addObject:[[TDRevisionProxy alloc] initWithTDRevision:rev]];
    }
    return result;
}

- (id)newRevision:(id)args {
    TDNewRevision * rev = [self.document newRevision];
    return rev ? [[TDNewRevisionProxy alloc] initWithTDNewRevision:rev] : nil;
}

- (id)properties {
    return self.document.properties;
}

- (id)userProperties {
    return self.document.userProperties;
}

- (id)propertyForKey:(id)args {
    NSString * key;
    ENSURE_ARG_AT_INDEX(key, args, 0, NSString)
    
    return [self.document propertyForKey:key];
}

- (id)putProperties:(id)args {
    NSDictionary * props;
    ENSURE_ARG_AT_INDEX(props, args, 0, NSDictionary)
    
    NSError * error = nil;
    TDRevision * rev = [self.document putProperties:props error:&error];
    
    if (error) {
        return [self errorDict:error];
    }
    else {
        return [[TDRevisionProxy alloc] initWithTDRevision:rev];
    }
    
}

#pragma mark Change Notifications

#define kDocumentChangedEventName @"change"

- (void)documentChanged:(NSNotification *)notification {
    [self fireEvent:kDocumentChangedEventName withObject:notification.userInfo];
}

- (void)_listenerAdded:(NSString*)type count:(int)count {
    if ([kDocumentChangedEventName isEqualToString:type] && count == 0) {
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(documentChanged:) name:kTDDocumentChangeNotification object:nil];
    }
}

- (void)_listenerRemoved:(NSString*)type count:(int)count {
    if ([kDocumentChangedEventName isEqualToString:type] && count == 0) {
        [[NSNotificationCenter defaultCenter] removeObserver:self name:kTDDocumentChangeNotification object:nil];
    }
}


@end
