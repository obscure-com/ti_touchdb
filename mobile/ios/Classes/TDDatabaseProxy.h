//
//  TDDatabaseProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TiProxy.h"
#import "TouchDB.h"

@interface TDDatabaseProxy : TiProxy
- (id)initWithTDDatabase:(TDDatabase *)database;
@end
