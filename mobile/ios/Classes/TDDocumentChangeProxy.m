//
//  TDDatabaseChangeProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 9/30/14.
//
//

#import "TDDocumentChangeProxy.h"

@implementation TDDocumentChangeProxy

+ (instancetype)proxyWithDatabase:(TDDatabaseProxy *)database documentChange:(CBLDatabaseChange *)change {
    return [[[TDDocumentChangeProxy alloc] initWithContext:database.pageContext documentChange:change] autorelease];
}

+ (instancetype)proxyWithDocument:(TDDocumentProxy *)document documentChange:(CBLDatabaseChange *)change {
    return [[[TDDocumentChangeProxy alloc] initWithContext:document.pageContext documentChange:change] autorelease];
}

- (id)initWithContext:(id<TiEvaluator>)context documentChange:(CBLDatabaseChange *)change {
    if (self = [super _initWithPageContext:context]) {
        self.documentId = change.documentID;
        self.revisionId = change.revisionID;
        self.isCurrentRevision = change.isCurrentRevision;
        self.isConflict = change.inConflict;
        self.sourceUrl = [change.source absoluteString];
    }
    return self;
}

@end
