//
//  CouchDesignDocumentProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 4/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CouchDesignDocumentProxy.h"

@implementation CouchDesignDocumentProxy

@synthesize designDocument;

- (id)initWithCouchDesignDocument:(CouchDesignDocument *)ddoc {
    if (self = [super init]) {
        self.designDocument = ddoc;
    }
    return self;
}

+ (CouchDesignDocumentProxy *)proxyWith:(CouchDesignDocument *)ddoc {
    return [[[CouchDesignDocumentProxy alloc] initWithCouchDesignDocument:ddoc] autorelease];
}

@end
