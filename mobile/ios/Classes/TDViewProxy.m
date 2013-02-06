//
//  TDViewProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TDViewProxy.h"
#import "TDBridge.h"
#import "TDQueryProxy.h"

@interface TDViewProxy ()
@property (nonatomic, strong) CBLView * view;
@end

@implementation TDViewProxy

- (id)initWithCBLView:(CBLView *)view {
    if (self = [super init]) {
        self.view = view;
    }
    return self;
}

- (id)name {
    return self.view.name;
}

- (id)setMapAndReduce:(id)args {
    KrollCallback * map;
    KrollCallback * reduce;
    NSString * version;
    ENSURE_ARG_OR_NULL_AT_INDEX(map, args, 0, KrollCallback)
    ENSURE_ARG_OR_NULL_AT_INDEX(reduce, args, 1, KrollCallback)

    CBLMapBlock mapblock = map ? [[TDBridge sharedInstance] mapBlockForCallback:map] : nil;
    CBLReduceBlock reduceblock = reduce ? [[TDBridge sharedInstance] reduceBlockForCallback:reduce] : nil;

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
    
    CBLMapBlock mapblock = map ? [[TDBridge sharedInstance] mapBlockForCallback:map] : nil;
    
    if (mapblock) {
        ENSURE_ARG_AT_INDEX(version, args, 1, NSString)
    }
    
    BOOL result = [self.view setMapBlock:mapblock version:version];
    return NUMBOOL(result);
}

- (id)query:(id)args {
    CBLQuery * query = [self.view query];
    return query ? [[TDQueryProxy alloc] initWithCBLQuery:query] : nil;
}

@end
