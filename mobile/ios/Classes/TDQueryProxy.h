//
//  TDQueryProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TiProxy.h"

@class TDDatabaseProxy;

@interface TDQueryProxy : TiProxy
+ (instancetype)proxyWithDatabase:(TDDatabaseProxy *)database query:(CBLQuery *)query;
@end
