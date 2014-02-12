//
//  TDAttachmentProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/11/12.
//
//

#import "TiProxy.h"

@class TDRevisionProxyBase;

@interface TDAttachmentProxy : TiProxy
+ (instancetype)proxyWithRevision:(TDRevisionProxyBase *)revision attachment:(CBLAttachment *)attachment;
@end
