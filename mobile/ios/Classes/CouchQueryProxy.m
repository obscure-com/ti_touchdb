//
//  CouchQueryProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 4/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CouchQueryProxy.h"
#import "CouchDesignDocumentProxy.h"
#import <CouchCocoa/CouchQuery.h>
#import <CouchCocoa/RESTOperation.h>

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

- (NSDictionary *)toQueryResult:(CouchQueryEnumerator *)e {
    if (!e) return nil;
    
    NSMutableArray * result = [NSMutableArray arrayWithCapacity:[e count]];
    for (CouchQueryRow * row in e) {
        [result addObject:[NSDictionary dictionaryWithObjectsAndKeys:row.documentID, @"id", row.key, @"key", row.value, @"value", row.documentProperties, @"doc", nil]];
    }
    
    return [NSDictionary dictionaryWithObjectsAndKeys:[NSNumber numberWithUnsignedInteger:e.totalCount], @"total_rows", [NSNumber numberWithUnsignedInteger:self.query.skip], @"offset", result, @"rows", nil];
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
    KrollCallback * cb;
    ENSURE_ARG_OR_NIL_AT_INDEX(cb, args, 0, KrollCallback);
    
    RESTOperation * op = [self.query start];
    if (cb) {
        [op onCompletion:^() {
            [cb call:[NSArray arrayWithObject:[self toQueryResult:op.resultObject]] thisObject:nil];
        }];
    }
}

//sync query
- (id)fetchRows:(id)args {
    return [self toQueryResult:[self.query rows]];
}

- (id)fetchRowsIfChanged:(id)args {
    return [self toQueryResult:[self.query rowsIfChanged]];
}

@end
