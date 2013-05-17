//
//  TDReplicationProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TiProxy.h"

@interface TDReplicationProxy : TiProxy
- (id)initWithExecutionContext:(id<TiEvaluator>)context CBLReplication:(CBLReplication *)replication;
@end
