//
//  TDQueryProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TiProxy.h"

@interface TDQueryProxy : TiProxy
- (id)initWithCBLQuery:(CBLQuery *)query;
@end
