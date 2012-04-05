//
//  CouchReplicationProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 4/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CouchReplicationProxy.h"

@implementation CouchReplicationProxy

@synthesize replication;

- (id)initWithCouchReplication:(CouchReplication *)rep {
    if (self = [super init]) {
        self.replication = rep;
    }
    return self;
}

+ (CouchReplicationProxy *)proxyWith:(CouchReplication *)rep {
    return [[[CouchReplicationProxy alloc] initWithCouchReplication:rep] autorelease];
}

@end
