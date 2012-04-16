//
//  CouchAttachmentProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 4/10/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CouchAttachmentProxy.h"
#import "CouchDocumentProxy.h"
#import "CouchRevisionProxy.h"
#import <CouchCocoa/CouchAttachment.h>
#import <CouchCocoa/RESTOperation.h>
#import "TiBlob.h"

@implementation CouchAttachmentProxy

@synthesize attachment;

- (id)initWithCouchAttachment:(CouchAttachment *)att {
    if (self = [super init]) {
        self.attachment = att;
    }
    return self;
}

+ (id)proxyWith:(CouchAttachment *)att {
    return att ? [[[CouchAttachmentProxy alloc] initWithCouchAttachment:att] autorelease] : nil;
}

#pragma mark PROPERTIES

- (id)revision {
    return [CouchRevisionProxy proxyWith:self.attachment.revision];
}

- (id)document {
    return [CouchDocumentProxy proxyWith:self.attachment.document];
}

- (id)name {
    return self.attachment.name;
}

- (id)contentType {
    return self.attachment.contentType;
}

- (id)length {
    return [NSNumber numberWithLong:self.attachment.length];
}

- (id)metadata {
    return self.attachment.metadata;
}

- (id)body {
    return [[[TiBlob alloc] initWithData:self.attachment.body mimetype:self.attachment.contentType] autorelease];
}

- (void)setBody:(id)val {
    TiBlob * body = (TiBlob *) val;
    self.attachment.body = body.data;
}

- (id)unversionedURL {
    return [self.attachment.unversionedURL absoluteString];
}

- (id)relativePath {
    return [self.attachment relativePath];
}

#pragma mark METHODS

// TODO do we need specific GET and PUT methods, or can they be baked into the accessors?

- (void)deleteAttachment:(id)args {
    RESTOperation * op = [self.attachment DELETE];
    if (![op wait]) {
        NSAssert(op.error.code == 200 || op.error.code == 404, @"Error deleting attachment: %@", op.error);
    }
}

@end
