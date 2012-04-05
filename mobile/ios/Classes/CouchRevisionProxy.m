//
//  CouchRevisionProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 4/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CouchRevisionProxy.h"
#import <CouchCocoa/CouchRevision.h>

@implementation CouchRevisionProxy

@synthesize revision;

- (id)initWithCouchRevision:(CouchRevision *)rev {
    if (self = [super init]) {
        self.revision = rev;
    }
    return self;
}

+ (CouchRevisionProxy *)proxyWith:(CouchRevision *)rev {
    return [[[CouchRevisionProxy alloc] initWithCouchRevision:rev] autorelease];
}

@end
