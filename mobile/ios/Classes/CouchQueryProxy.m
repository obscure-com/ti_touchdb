//
//  CouchQueryProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 4/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CouchQueryProxy.h"
#import <CouchCocoa/CouchQuery.h>

@implementation CouchQueryProxy

@synthesize query;

- (id)initWithCouchQuery:(CouchQuery *)q {
    if (self = [super init]) {
        self.query = q;
    }
    return self;
}

+ (CouchQueryProxy *)proxyWith:(CouchQuery *)q {
    return [[[CouchQueryProxy alloc] initWithCouchQuery:q] autorelease];
}

@end
