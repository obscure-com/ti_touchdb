//
//  CouchReplicationProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 4/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "TiProxy.h"

@interface CouchReplicationProxy : TiProxy
@property (nonatomic, strong) CouchReplication * replication;
+ (CouchReplicationProxy *)proxyWith:(CouchReplication *)rep;
@end
