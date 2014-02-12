//
//  TDReplicationProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TiProxy.h"

@class TDDatabaseProxy;

@interface TDReplicationProxy : TiProxy
+ (instancetype)proxyWithDatabase:(TDDatabaseProxy *)database replication:(CBLReplication *)replication;
@end
