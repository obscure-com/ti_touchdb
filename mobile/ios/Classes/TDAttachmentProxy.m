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
@property (nonatomic, assign) TDRevisionProxyBase * rev;
@property (nonatomic, strong) CBLAttachment * attachment;
@end

@implementation TDAttachmentProxy

{
    NSError * lastError;
}

+ (instancetype)proxyWithRevision:(TDRevisionProxyBase *)revision attachment:(CBLAttachment *)attachment {
    return [[[TDAttachmentProxy alloc] initWithRevision:revision attachment:attachment] autorelease];
}

- (id)initWithRevision:(TDRevisionProxyBase *)revision attachment:(CBLAttachment *)attachment {
    if (self = [super _initWithPageContext:revision.pageContext]) {
        self.rev = revision;
        self.attachment = attachment;
    }
    return self;
}

- (void)dealloc {
    RELEASE_TO_NIL(lastError)
    [super dealloc];
}

- (id)revision {
    return self.rev;
}

- (id)document {
    return self.rev.doc;
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
    return [self errorDict:lastError];
}

@end
