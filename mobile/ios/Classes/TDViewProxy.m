//
//  TDViewProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TDViewProxy.h"
#import "TDDatabaseProxy.h"
#import "TDBridge.h"
#import "TDQueryProxy.h"

@interface TDViewProxy ()
@property (nonatomic, assign) TDDatabaseProxy * database;
@property (nonatomic, strong) CBLView * view;
@property (nonatomic, assign) KrollCallback * _map;
@property (nonatomic, assign) KrollCallback * _reduce;
@end

@implementation TDViewProxy

+ (instancetype)proxyWithDatabase:(TDDatabaseProxy *)database view:(CBLView *)view {
    return [[[TDViewProxy alloc] initWithDatabase:database view:view] autorelease];
    
}

- (id)initWithDatabase:(TDDatabaseProxy *)database view:(CBLView *)view {
    if (self = [super _initWithPageContext:database.pageContext]) {
        self.database = database;
        self.view = view;
    }
    return self;
}

- (id)name {
    return self.view.name;
}

- (id)setMapReduce:(id)args {
    KrollCallback * map;
    KrollCallback * reduce;
    NSString * version;
    ENSURE_ARG_OR_NULL_AT_INDEX(map, args, 0, KrollCallback)
    ENSURE_ARG_OR_NULL_AT_INDEX(reduce, args, 1, KrollCallback)

    self._map = map;
    self._reduce = reduce;
    
    CBLMapBlock mapblock = map ? [[TDBridge sharedInstance] mapBlockForCallback:map inExecutionContext:[self executionContext]] : nil;
    CBLReduceBlock reduceblock = reduce ? [[TDBridge sharedInstance] reduceBlockForCallback:reduce inExecutionContext:[self executionContext]] : nil;

    if (mapblock) {
        ENSURE_ARG_AT_INDEX(version, args, 2, NSString)
    }
    
    BOOL result = [self.view setMapBlock:mapblock reduceBlock:reduceblock version:version];
    return NUMBOOL(result);
}

- (id)setMap:(id)args {
    KrollCallback * map;
    NSString * version = nil;
    ENSURE_ARG_OR_NULL_AT_INDEX(map, args, 0, KrollCallback)
    
    self._map = map;
    self._reduce = nil;
    
    CBLMapBlock mapblock = map ? [[TDBridge sharedInstance] mapBlockForCallback:map inExecutionContext:[self executionContext]] : nil;
    
    if (mapblock) {
        ENSURE_ARG_AT_INDEX(version, args, 1, NSString)
    }
    
    BOOL result = [self.view setMapBlock:mapblock version:version];
    return NUMBOOL(result);
}

- (id)map {
    return self._map;
}

- (id)reduce {
    return self._reduce;
}

- (id)isStale {
    return NUMBOOL(self.view.stale);
}

- (id)lastSequenceIndexed {
    return NUMLONG(self.view.lastSequenceIndexed);
}

- (void)deleteIndex:(id)args {
    [self.view deleteIndex];
}

- (void)deleteView:(id)args {
    [self.view deleteView];
}

- (id)createQuery:(id)args {
    CBLQuery * query = [self.view createQuery];
    return query ? [TDQueryProxy proxyWithDatabase:self.database query:query] : nil;
}

@end
