//
//  TDRevisionProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TiProxy.h"
#import "TouchDB.h"

@interface TDRevisionProxyBase : TiProxy
@end

@interface TDRevisionProxy : TDRevisionProxyBase
- (id)initWithTDRevision:(TDRevision *)revision;
@end


@interface TDNewRevisionProxy : TDRevisionProxyBase
- (id)initWithTDNewRevision:(TDNewRevision *)revision;
@end