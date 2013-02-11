//
//  TDRevisionProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TiProxy.h"

@interface TDRevisionProxyBase : TiProxy
@end

@interface TDRevisionProxy : TDRevisionProxyBase
- (id)initWithExecutionContext:(id<TiEvaluator>)context CBLRevision:(CBLRevision *)revision;
@end


@interface CBLNewRevisionProxy : TDRevisionProxyBase
- (id)initWithExecutionContext:(id<TiEvaluator>)context CBLNewRevision:(CBLNewRevision *)revision;
@end