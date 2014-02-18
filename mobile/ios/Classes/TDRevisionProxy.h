//
//  TDRevisionProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TiProxy.h"

@class TDDocumentProxy;

@interface TDRevisionProxyBase : TiProxy
- (id)revisionID;
@end

@interface TDSavedRevisionProxy : TDRevisionProxyBase
+ (instancetype)proxyWithDocument:(TDDocumentProxy *)document savedRevision:(CBLSavedRevision *)revision;
@end


@interface TDUnsavedRevisionProxy : TDRevisionProxyBase
+ (instancetype)proxyWithDocument:(TDDocumentProxy *)document unsavedRevision:(CBLUnsavedRevision *)revision;
@end