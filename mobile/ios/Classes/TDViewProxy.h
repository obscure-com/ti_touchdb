//
//  TDViewProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TiProxy.h"

@interface TDViewProxy : TiProxy
- (id)initWithExecutionContext:(id<TiEvaluator>)context CBLView:(CBLView *)view;
@end
