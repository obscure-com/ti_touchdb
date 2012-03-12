/**
 * $Id$
 * 
 * Copyright (c) 2012 Paul Mietz Egli
 * Licensed under the Apache Public License version 2.
 */

#import "TDViewProxy.h"
#import "TDDatabaseProxy.h"

@implementation TDViewProxy

@synthesize view;

#pragma mark Lifecycle

- (id)initWithTDView:(TDView *)aView {
    if (self = [super init]) {
        self.view = aView;
    }
    return self;
}


#pragma mark -
#pragma mark TDView

- (void)deleteView:(id)args {
    [self.view deleteView];
}

- (id)name {
    return self.view.name;
}

- (id)stale {
    return [NSNumber numberWithBool:self.view.stale];
}

- (id)lastSequenceIndexed {
    return [NSNumber numberWithLong:self.view.lastSequenceIndexed];
}

- (id)queryWithOptions:(id)args {
    NSDictionary * queryOptionsDict;
    ENSURE_ARG_OR_NIL_AT_INDEX(queryOptionsDict, args, 0, NSDictionary);
    
    TDStatus status;
    TDQueryOptions queryOptions = kDefaultTDQueryOptions;
    
    [TDDatabaseProxy populateQueryOptions:&queryOptions fromDict:queryOptionsDict];
    return [self.view queryWithOptions:&queryOptions status:&status];
}

- (id)updateIndex:(id)args {
    return [NSNumber numberWithInt:[self.view updateIndex]];
}

@end
