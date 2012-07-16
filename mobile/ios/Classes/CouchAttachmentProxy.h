//
//  CouchAttachmentProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 4/10/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "TiProxy.h"

@interface CouchAttachmentProxy : TiProxy
@property (nonatomic, strong) CouchAttachment * attachment;
+ (id)proxyWith:(CouchAttachment *)att;
@end
