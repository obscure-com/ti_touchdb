//
//  TDAttachmentProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/11/12.
//
//

#import "TDAttachmentProxy.h"
#import "TiProxy+Errors.h"
#import "TiBlob.h"

@interface TDAttachmentProxy ()
@property (nonatomic, strong) TDAttachment * attachment;
@end

@implementation TDAttachmentProxy

- (id)initWithTDAttachment:(TDAttachment *)attachment {
    if (self = [super init]) {
        self.attachment = attachment;
    }
    return self;
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

- (id)body {
    return [[TiBlob alloc] initWithData:self.attachment.body mimetype:self.attachment.contentType];
}

- (id)bodyURL {
    return [self.attachment.bodyURL absoluteString];
}

- (id)updateBody:(id)args {
    TiBlob * body;
    NSString * contentType;
    ENSURE_ARG_AT_INDEX(body, args, 0, TiBlob)
    ENSURE_ARG_OR_NULL_AT_INDEX(contentType, args, 1, NSString)
    
    NSError * error = nil;
    TDAttachment * att = [self.attachment updateBody:body.data contentType:contentType error:&error];
    return error ? [self errorDict:error] : [[TDAttachmentProxy alloc] initWithTDAttachment:att];
}

@end
