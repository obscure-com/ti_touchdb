//
//  TDViewProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TiProxy.h"

@class TDDatabaseProxy;

@interface TDViewProxy : TiProxy
+ (instancetype)proxyWithDatabase:(TDDatabaseProxy *)database view:(CBLView *)view;
@end
