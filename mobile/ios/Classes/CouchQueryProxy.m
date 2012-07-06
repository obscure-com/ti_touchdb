//
//  CouchQueryProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 4/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CouchQueryProxy.h"
#import "CouchDesignDocumentProxy.h"
#import "CouchDocumentProxy.h"
#import "Couch/CouchQuery.h"
#import "REST/RESTOperation.h"

@implementation CouchQueryProxy

@synthesize query;

- (id)initWithCouchQuery:(CouchQuery *)q {
    if (self = [super init]) {
        self.query = q;
    }
    return self;
}

+ (CouchQueryProxy *)proxyWith:(CouchQuery *)q {
    return q ? [[[CouchQueryProxy alloc] initWithCouchQuery:q] autorelease] : nil;
}

#pragma mark PROPERTIES
                                                                                                                        
- (id)designDocument {
    return [CouchDesignDocumentProxy proxyWith:self.query.designDocument];
}

- (id)limit {
    return [NSNumber numberWithUnsignedInteger:self.query.limit];
}

- (void)setLimit:(id)val {
    self.query.limit = [val unsignedIntegerValue];
}

- (id)skip {
    return [NSNumber numberWithUnsignedInteger:self.query.skip];
}

- (void)setSkip:(id)val {
    self.query.skip = [val unsignedIntegerValue];
}

- (id)descending {
    return [NSNumber numberWithBool:self.query.descending];
}

- (void)setDescending:(id)val {
    self.query.descending = [val boolValue];
}

- (id)startKey {
    return self.query.startKey;
}

- (void)setStartKey:(id)val {
    self.query.startKey = val;
}

- (id)endKey {
    return self.query.endKey;
}

- (void)setEndKey:(id)val {
    self.query.endKey = val;
}

- (id)startKeyDocID {
    return self.query.startKeyDocID;
}

- (void)setStartKeyDocID:(id)val {
    self.query.startKeyDocID = val;
}

- (id)endKeyDocID {
    return self.query.endKeyDocID;
}

- (void)setEndKeyDocID:(id)val {
    self.query.endKeyDocID = val;
}

- (id)stale {
    return [NSNumber numberWithInt:self.query.stale];
}

- (void)setStale:(id)val {
    self.query.stale = [val intValue];
}

- (id)keys {
    return self.query.keys;
}

- (void)setKeys:(id)val {
    self.query.keys = val;
}

- (id)groupLevel {
    return [NSNumber numberWithUnsignedInteger:self.query.groupLevel];
}

- (void)setGroupLevel:(id)val {
    self.query.groupLevel = [val unsignedIntegerValue];
}

- (id)prefetch {
    return [NSNumber numberWithBool:self.query.prefetch];
}

- (void)setPrefetch:(id)val {
    self.query.prefetch = [val boolValue];
}

// async query
- (void)start:(id)args {
    ENSURE_UI_THREAD_1_ARG(args)

    KrollCallback * cb;
    ENSURE_ARG_OR_NIL_AT_INDEX(cb, args, 0, KrollCallback);
    
    RESTOperation * op = [self.query start];
    if (cb) {
        [op onCompletion:^() {
            [cb call:[NSArray arrayWithObject:[CouchQueryEnumeratorProxy proxyWith:op.resultObject]] thisObject:nil];
        }];
    }
}

//sync query
- (id)rows:(id)args {
    ENSURE_UI_THREAD_1_ARG(args)
    return [CouchQueryEnumeratorProxy proxyWith:[self.query rows]];
}

- (id)rowsIfChanged:(id)args {
    ENSURE_UI_THREAD_1_ARG(args)
    return [CouchQueryEnumeratorProxy proxyWith:[self.query rowsIfChanged]];
}

@end


@implementation CouchQueryRowProxy
@synthesize row;

- (id)initWithCouchQueryRow:(CouchQueryRow *)r {
    if (self = [super init]) {
        self.row = r;
    }
    return self;
}

+ (CouchQueryRowProxy *)proxyWith:(CouchQueryRow *)r {
    return r ? [[[CouchQueryRowProxy alloc] initWithCouchQueryRow:r] autorelease] : nil;
}

#pragma mark PROPERTIES

/* TODO
- (id)query {
    return [CouchQueryProxy proxyWith:self.row.query];
}
*/

- (id)key {
    return self.row.key;
}

- (id)value {
    return self.row.value;
}

- (id)documentID {
    return self.row.documentID;
}

- (id)sourceDocumentID {
    return self.row.sourceDocumentID;
}

- (id)documentRevision {
    return self.row.documentRevision;
}

- (id)document {
    return [CouchDocumentProxy proxyWith:self.row.document];
}

- (id)documentProperties {
    return self.row.documentProperties;
}

#pragma mark METHODS

- (id)keyAtIndex:(id)args {
    NSNumber * index;
    ENSURE_ARG_AT_INDEX(index, args, 0, NSNumber)
    return [self.row keyAtIndex:[index unsignedIntegerValue]];
}

@end


@implementation CouchQueryEnumeratorProxy
@synthesize enumerator;

- (id)initWithCouchQueryEnumerator:(CouchQueryEnumerator *)e {
    if (self = [super init]) {
        self.enumerator = e;
    }
    return self;
}

+ (CouchQueryEnumeratorProxy *)proxyWith:(CouchQueryEnumerator *)e {
    return e ? [[[CouchQueryEnumeratorProxy alloc] initWithCouchQueryEnumerator:e] autorelease] : nil;
}

#pragma mark PROPERTIES

- (id)rowCount {
    return [NSNumber numberWithUnsignedInteger:self.enumerator.count];
}

- (id)totalCount {
    return [NSNumber numberWithUnsignedInteger:self.enumerator.totalCount];
}

- (id)sequenceNumber {
    return [NSNumber numberWithUnsignedInteger:self.enumerator.sequenceNumber];
}

#pragma mark METHODS

- (id)nextRow:(id)args {
    return [CouchQueryRowProxy proxyWith:[self.enumerator nextRow]];
}

- (id)rowAtIndex:(id)args {
    NSNumber * index;
    ENSURE_ARG_AT_INDEX(index, args, 0, NSNumber)

    return [CouchQueryRowProxy proxyWith:[self.enumerator rowAtIndex:[index unsignedIntegerValue]]];
}

@end
