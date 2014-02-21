//
//  TDDocumentProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TiProxy.h"

@class TDDatabaseProxy;

@interface TDDocumentProxy : TiProxy
@property (nonatomic, assign) TDDatabaseProxy * db;
+ (instancetype)proxyWithDatabase:(TDDatabaseProxy *)database document:(CBLDocument *)document;
@end
