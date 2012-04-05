//
//  CouchDocumentProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 4/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CouchDocumentProxy.h"

@implementation CouchDocumentProxy

@synthesize document;

- (id)initWithCouchDocument:(CouchDocument *)doc {
    if (self = [super init]) {
        self.document = doc;
    }
    return self;
}

+ (CouchDocumentProxy *)proxyWith:(CouchDocument *)doc {
    return [[[CouchDocumentProxy alloc] initWithCouchDocument:doc] autorelease];
}

@end
