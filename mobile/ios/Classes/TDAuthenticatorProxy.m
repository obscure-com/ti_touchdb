//
//  TDAuthenticatorProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 7/14/14.
//
//

#import "TDAuthenticatorProxy.h"

@implementation TDAuthenticatorProxy

+ (instancetype)proxyWithAuthenticator:(id)authenticator {
    return [[TDAuthenticatorProxy alloc] initWithAuthenticator:authenticator];
}

- (id)initWithAuthenticator:(id<CBLAuthenticator>)authenticator {
    if (self = [super init]) {
        self.authenticator = authenticator;
    }
    return self;
}

@end
