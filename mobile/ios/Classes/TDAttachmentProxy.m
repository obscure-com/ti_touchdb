//
//  TDAttachmentProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/11/12.
//
//

#import "TDAttachmentProxy.h"
#import "TDRevisionProxy.h"
#import "TiProxy+Errors.h"
#import "TiBlob.h"

@interface TDAttachmentProxy ()
@property (nonatomic, strong) CBLAttachment * attachment;
@end

@implementation TDAttachmentProxy

{
    NSError * lastError;
}

- (id)initWithExecutionContext:(id<TiEvaluator>)context CBLAttachment:(CBLAttachment *)attachment {
    if (self = [super _initWithPageContext:context]) {
        self.attachment = attachment;
    }
    return self;
}

- (void)dealloc {
    RELEASE_TO_NIL(lastError)
    [super dealloc];
}

- (id)name {
    return self.attachment.name;
}

- (id)contentType {
    return self.attachment.contentType;
}

- (id)length {
    return NUMLONG(self.attachment.length);
}

- (id)metadata {
    return self.attachment.metadata;
}

- (id)content {
    return [[TiBlob alloc] initWithData:self.attachment.content mimetype:self.attachment.contentType];
}

- (id)contentURL {
    return [self.attachment.contentURL absoluteString];
}

- (id)error {
    return lastError ? [self errorDict:lastError] : nil;
}

@end
