//
//  TDDatabaseProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TiProxy.h"

@class TDDatabaseManagerProxy;
@class TDDocumentProxy;

@interface TDDatabaseProxy : TiProxy
+ (instancetype)proxyWithManager:(TDDatabaseManagerProxy *)manager database:(CBLDatabase *)database;

- (TDDocumentProxy *)_existingDocumentWithID:(NSString *)documentID;
- (void)_removeProxyForDocument:(NSString *)documentID;
@end
