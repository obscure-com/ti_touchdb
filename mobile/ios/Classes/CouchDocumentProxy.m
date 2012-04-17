//
//  CouchDocumentProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 4/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CouchDocumentProxy.h"
#import "CouchRevisionProxy.h"
#import "TiProxy+Errors.h"
#import <CouchCocoa/CouchDocument.h>
#import <CouchCocoa/RESTOperation.h>

@implementation CouchDocumentProxy

@synthesize document;

// TODO change notifications

- (id)initWithCouchDocument:(CouchDocument *)doc {
    if (self = [super init]) {
        self.document = doc;
    }
    return self;
}

+ (CouchDocumentProxy *)proxyWith:(CouchDocument *)doc {
    return doc ? [[[CouchDocumentProxy alloc] initWithCouchDocument:doc] autorelease] : nil;
}

- (id)documentID {
    return self.document.documentID;
}

- (id)abbreviatedID {
    return self.document.abbreviatedID;
}

- (id)isDeleted {
    return [NSNumber numberWithBool:self.document.isDeleted];
}

- (void)deleteDocument:(id)args {
    RESTOperation * op = [self.document DELETE];
    if (![op wait]) {
        NSAssert(op.error.code == 404, @"Error deleting document: %@", op.error);
    }
}

// skip modelObject

#pragma mark REVISIONS:

- (id)currentRevisionID {
    return self.document.currentRevisionID;
}

- (id)currentRevision {
    return [CouchRevisionProxy proxyWith:[self.document currentRevision]];
}

- (id)revisionWithID:(id)args {
    NSString * revid;
    ENSURE_ARG_AT_INDEX(revid, args, 0, NSString)
    
    return [CouchRevisionProxy proxyWith:[self.document revisionWithID:revid]];
}

- (id)getRevisionHistory:(id)args {
    NSArray * revs = [self.document getRevisionHistory];
    NSMutableArray * result = [NSMutableArray arrayWithCapacity:[revs count]];
    
    for (CouchRevision * rev in revs) {
        [result addObject:[CouchRevisionProxy proxyWith:rev]];
    }
    
    return result;
}

#pragma mark PROPERTIES:

- (id)properties {
    return self.document.properties;
}

- (id)userProperties {
    return self.document.userProperties;
}

- (id)putProperties:(id)args {
    NSDictionary * props;
    ENSURE_ARG_AT_INDEX(props, args, 0, NSDictionary)
    
    RESTOperation * op = [self.document putProperties:props];
    if (![op wait]) {
        NSAssert(op.error.code == 412, @"Error putting document properties: %@", op.error);
    }
    
    return (op.error.code == 200 || op.error.code == 201) ? [CouchRevisionProxy proxyWith:[op resultObject]] : [self errorDict:op.error];
}

#pragma mark CONFLICTS:

- (id)getConflictingRevisions:(id)args {
    NSArray * revs = [self.document getConflictingRevisions];
    NSMutableArray * result = [NSMutableArray arrayWithCapacity:[revs count]];
    
    for (CouchRevision * rev in revs) {
        [result addObject:[CouchRevisionProxy proxyWith:rev]];
    }
    
    return result;    
}

- (id)resolveConflictingRevisions:(id)args {
    NSArray * conflictProxies;
    id resolution;
    
    ENSURE_ARG_AT_INDEX(conflictProxies, args, 0, NSArray)
    ENSURE_ARG_AT_INDEX(resolution, args, 1, NSObject)
    
    NSMutableArray * conflicts = [NSMutableArray arrayWithCapacity:[conflictProxies count]];
    for (CouchRevisionProxy * p in conflictProxies) {
        [conflicts addObject:p.revision];
    }
    
    RESTOperation * op = nil;
    if ([resolution isKindOfClass:[CouchRevisionProxy class]]) {
        op = [self.document resolveConflictingRevisions:conflicts withRevision:((CouchRevisionProxy *)resolution).revision];
    }
    else if ([resolution isKindOfClass:[NSDictionary class]]) {
        op = [self.document resolveConflictingRevisions:conflicts withProperties:(NSDictionary *)resolution];
    }
    
    NSAssert(op, @"Invalid object passed to resolveConflictingRevisions: %@", [op class]);
    
    if (![op wait]) {
        return [NSNumber numberWithBool:NO];
    }
    
    return [NSNumber numberWithBool:YES];
}

@end
