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

@interface TDSavedRevisionProxy : TDRevisionProxyBase
- (id)initWithExecutionContext:(id<TiEvaluator>)context CBLSavedRevision:(CBLSavedRevision *)revision;
@end


@interface TDUnsavedRevisionProxy : TDRevisionProxyBase
- (id)initWithExecutionContext:(id<TiEvaluator>)context CBLUnsavedRevision:(CBLUnsavedRevision *)revision;
@end