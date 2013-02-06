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
- (id)initWithCBLRevision:(CBLRevision *)revision;
@end


@interface CBLNewRevisionProxy : TDRevisionProxyBase
- (id)initWithCBLNewRevision:(CBLNewRevision *)revision;
@end