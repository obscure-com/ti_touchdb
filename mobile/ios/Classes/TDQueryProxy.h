//
//  TDQueryProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TiProxy.h"

@interface TDQueryProxy : TiProxy
- (id)initWithExecutionContext:(id<TiEvaluator>)context CBLQuery:(CBLQuery *)query;
@end
