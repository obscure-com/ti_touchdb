//
//  TDAttachmentProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/11/12.
//
//

#import "TiProxy.h"

@interface TDAttachmentProxy : TiProxy
- (id)initWithExecutionContext:(id<TiEvaluator>)context CBLAttachment:(CBLAttachment *)attachment;
@end
