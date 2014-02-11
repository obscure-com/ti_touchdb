//
//  TDDatabaseManagerProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TiProxy.h"
#import "TDDatabaseProxy.h"

@class ComObscureTitouchdbModule;

@interface TDDatabaseManagerProxy : TiProxy
+ (instancetype)proxyWithModule:(ComObscureTitouchdbModule *)module;
- (void)forgetDatabaseProxyNamed:(NSString *)name;
@end
