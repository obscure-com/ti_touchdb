//
//  CouchDatabaseProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 4/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "TiProxy.h"

@interface CouchDatabaseProxy : TiProxy
@property (nonatomic, strong) CouchDatabase * database;
+ (CouchDatabaseProxy *)proxyWith:(CouchDatabase *)db;
@end
