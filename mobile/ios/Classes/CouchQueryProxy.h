//
//  CouchQueryProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 4/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "TiProxy.h"

@class CouchQuery;

@interface CouchQueryProxy : TiProxy
@property (nonatomic, strong) CouchQuery * query;
+ (CouchQueryProxy *)proxyWith:(CouchQuery *)q;
@end
