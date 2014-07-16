//
//  TDAuthenticatorProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 7/14/14.
//
//

#import "TiProxy.h"
#import "CBLAuthenticator.h"

@interface TDAuthenticatorProxy : TiProxy
@property (nonatomic, strong) id<CBLAuthenticator> authenticator;
+ (instancetype)proxyWithAuthenticator:(id<CBLAuthenticator>)authenticator;
@end
