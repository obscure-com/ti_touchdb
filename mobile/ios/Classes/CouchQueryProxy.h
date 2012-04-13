//
//  CouchQueryProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 4/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "TiProxy.h"

@class CouchQuery, CouchQueryRow, CouchQueryEnumerator;

@interface CouchQueryProxy : TiProxy
@property (nonatomic, strong) CouchQuery * query;
+ (CouchQueryProxy *)proxyWith:(CouchQuery *)q;
@end

@interface CouchQueryRowProxy :TiProxy
@property (nonatomic, strong) CouchQueryRow * row;
+ (CouchQueryRowProxy *)proxyWith:(CouchQueryRow *)e;
@end

@interface CouchQueryEnumeratorProxy :TiProxy
@property (nonatomic, strong) CouchQueryEnumerator * enumerator;
+ (CouchQueryEnumeratorProxy *)proxyWith:(CouchQueryEnumerator *)e;
@end