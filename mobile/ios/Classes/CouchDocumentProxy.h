//
//  CouchDocumentProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 4/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "TiProxy.h"

@class CouchDocument;

@interface CouchDocumentProxy : TiProxy
@property (nonatomic, strong) CouchDocument * document;
+ (CouchDocumentProxy *)proxyWith:(CouchDocument *)doc;
- (id)initWithCouchDocument:(CouchDocument *)doc;
@end
