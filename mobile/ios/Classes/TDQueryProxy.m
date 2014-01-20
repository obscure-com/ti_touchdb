//
//  TDQueryProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TDQueryProxy.h"
#import "TiProxy+Errors.h"
#import "TDDocumentProxy.h"
#import "TDRevisionProxy.h"

@interface TDQueryProxy ()
@property (nonatomic, strong) CBLQuery * query;
@property (nonatomic, strong) NSError * lastError;
@end

@interface CBLQueryEnumeratorProxy : TiProxy
@property (nonatomic, strong) CBLQueryEnumerator * enumerator;
- (id)initWithCBLQueryEnumerator:(CBLQueryEnumerator *)e;
@end

@interface CBLQueryRowProxy : TiProxy
@property (nonatomic, strong) CBLQueryRow * row;
- (id)initWithCBLQueryRow:(CBLQueryRow *)row;
@end


@implementation TDQueryProxy

- (id)initWithExecutionContext:(id<TiEvaluator>)context CBLQuery:(CBLQuery *)query {
    if (self = [super _initWithPageContext:context]) {
        self.query = query;
    }
    return self;
}

#pragma mark Properties

- (id)limit {
    return NUMINT(self.query.limit);
}

- (void)setLimit:(id)value {
    self.query.limit = [value unsignedIntegerValue];
}

- (id)skip {
    return NUMINT(self.query.skip);
}

- (void)setSkip:(id)value {
    self.query.skip = [value unsignedIntegerValue];
}

- (id)descending {
    return NUMBOOL(self.query.descending);
}

- (void)setDescending:(id)value {
    self.query.descending = [value boolValue];
}

- (id)startKey {
    return self.query.startKey;
}

- (void)setStartKey:(id)value {
    self.query.startKey = value;
}

- (id)endKey {
    return self.query.endKey;
}

- (void)setEndKey:(id)value {
    self.query.endKey = value;
}

- (id)startKeyDocID {
    return self.query.startKeyDocID;
}

- (void)setStartKeyDocID:(id)value {
    self.query.startKeyDocID = value;
}

- (id)endKeyDocID {
    return self.query.endKeyDocID;
}

- (void)setEndKeyDocID:(id)value {
    self.query.endKeyDocID = value;
}

- (id)indexUpdateMode {
    return NUMINT(self.query.indexUpdateMode);
}

- (void)setIndexUpdateMode:(id)value {
    self.query.indexUpdateMode = [value intValue];
}

- (id)keys {
    return self.query.keys;
}

- (void)setKeys:(id)value {
    self.query.keys = value;
}

- (id)mapOnly {
    return NUMBOOL(self.query.mapOnly);
}

- (void)setMapOnly:(id)value {
    self.query.mapOnly = [value boolValue];
}

- (id)groupLevel {
    return NUMINT(self.query.groupLevel);
}

- (void)setGroupLevel:(id)value {
    self.query.groupLevel = [value unsignedIntegerValue];
}

- (id)prefetch {
    return NUMBOOL(self.query.prefetch);
}

- (void)setPrefetch:(id)value {
    self.query.prefetch = [value boolValue];
}

- (id)allDocsMode {
    return NUMINT(self.query.allDocsMode);
}

- (void)setAllDocsMode:(id)value {
    self.query.allDocsMode = [value intValue];
}

- (id)error {
    return [self errorDict:self.lastError];
}

#pragma mark Public API

- (id)run:(id)args {
    NSError * error = nil;
    CBLQueryEnumerator * e = [self.query run:&error];
    self.lastError = error;
    
    return e ? [[CBLQueryEnumeratorProxy alloc] initWithCBLQueryEnumerator:e] : nil;
}

@end


@implementation CBLQueryEnumeratorProxy

- (id)initWithCBLQueryEnumerator:(CBLQueryEnumerator *)e {
    if (self = [super init]) {
        self.enumerator = e;
    }
    return self;
}

- (id)count {
    return NUMINT(self.enumerator.count);
}

- (id)sequenceNumber {
    return NUMINT(self.enumerator.sequenceNumber);
}

- (id)stale {
    return NUMBOOL(self.enumerator.stale);
}

- (id)nextRow:(id)args {
    CBLQueryRow * row = [self.enumerator nextRow];
    return row ? [[CBLQueryRowProxy alloc] initWithCBLQueryRow:row] : nil;
}

- (id)rowAtIndex:(id)args {
    NSNumber * index;
    ENSURE_ARG_AT_INDEX(index, args, 0, NSNumber)
    
    CBLQueryRow * row = [self.enumerator rowAtIndex:[index unsignedIntValue]];
    return row ? [[CBLQueryRowProxy alloc] initWithCBLQueryRow:row] : nil;
}

- (void)reset:(id)args {
    [self.enumerator reset];
}

@end


@implementation CBLQueryRowProxy

- (id)initWithCBLQueryRow:(CBLQueryRow *)row {
    if (self = [super init]) {
        self.row = row;
    }
    return self;
}

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
    return self.row.document ? [[TDDocumentProxy alloc] initWithExecutionContext:[self executionContext] CBLDocument:self.row.document] : nil;
}

- (id)documentProperties {
    return self.row.documentProperties;
}

-(id)keyAtIndex:(id)args {
    NSNumber * index;
    ENSURE_ARG_AT_INDEX(index, args, 0, NSNumber)
    return [self.row keyAtIndex:[index unsignedIntegerValue]];
}

- (id)key0 {
    return self.row.key0;
}

- (id)key1 {
    return self.row.key1;
}

- (id)key2 {
    return self.row.key2;
}

- (id)key3 {
    return self.row.key3;
}

- (id)sequenceNumber {
    return NUMINT(self.row.sequenceNumber);
}

- (id)conflictingRevisions {
    NSMutableArray * result = [NSMutableArray array];
    for (CBLSavedRevision * rev in self.row.conflictingRevisions) {
        [result addObject:[[TDSavedRevisionProxy alloc] initWithExecutionContext:[self executionContext] CBLSavedRevision:rev]];
    }
    return result;
}

@end