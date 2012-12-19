//
//  TDDatabaseManagerProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TiProxy.h"

@interface TDDatabaseManagerProxy : TiProxy
@property (readonly) NSArray * allDatabaseNames;
+ (TDDatabaseManagerProxy *)sharedInstance;
@end
