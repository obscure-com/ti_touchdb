//
//  TDDatabaseProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TiProxy.h"

@interface TDDatabaseProxy : TiProxy
- (id)initWithCBLDatabase:(CBLDatabase *)database;
@end
